"""
services/vision/image_utils.py
Image preprocessing utilities for face/palm analysis.

Handles:
  - EXIF orientation correction (mobile photos often have rotation metadata)
  - Image resizing for performance (large mobile photos can be 4000x3000+)
"""
from __future__ import annotations
import struct
import numpy as np


def fix_exif_orientation(img: np.ndarray, jpeg_bytes: bytes | None = None) -> np.ndarray:
    """
    Correct image orientation based on EXIF metadata.

    Mobile photos (especially from iPhone/Android) embed orientation info in EXIF.
    OpenCV doesn't auto-rotate, so MediaPipe may fail to detect faces/palms
    in rotated images.

    Args:
        img: Decoded image array (BGR from cv2.imdecode)
        jpeg_bytes: Original JPEG bytes to read EXIF from. If None, returns img unchanged.

    Returns:
        Correctly oriented image array.
    """
    if jpeg_bytes is None or len(jpeg_bytes) < 12:
        return img

    # Only process JPEG files (starts with FF D8 FF)
    if jpeg_bytes[:2] != b'\xff\xd8':
        return img

    try:
        orientation = _read_exif_orientation(jpeg_bytes)
        if orientation is None or orientation == 1:
            return img
        return _apply_orientation(img, orientation)
    except Exception:
        return img


def _read_exif_orientation(data: bytes) -> int | None:
    """
    Read EXIF orientation tag from JPEG bytes without external dependencies.

    Returns orientation value (1-8) or None if not found.
    """
    # JPEG starts with FF D8, APP1 marker is FF E1
    pos = 2
    while pos < len(data) - 1:
        if data[pos] != 0xFF:
            return None
        marker = data[pos + 1]
        if marker == 0xE1:  # APP1 (EXIF)
            return _parse_exif(data, pos + 2)
        elif marker == 0xDA:  # Start of scan - no more markers
            return None
        elif marker in (0xD8, 0xD9):
            return None
        else:
            # Skip this segment
            if pos + 3 >= len(data):
                return None
            seg_len = struct.unpack('>H', data[pos + 2:pos + 4])[0]
            pos += 2 + seg_len
    return None


def _parse_exif(data: bytes, offset: int) -> int | None:
    """Parse EXIF data starting at offset to find orientation tag."""
    if offset + 6 >= len(data):
        return None

    # Check for "Exif\0\0" header
    if data[offset:offset + 6] != b'Exif\x00\x00':
        return None

    tiff_start = offset + 6
    if tiff_start + 8 >= len(data):
        return None

    # Read byte order
    byte_order = data[tiff_start:tiff_start + 2]
    if byte_order == b'II':
        endian = '<'
    elif byte_order == b'MM':
        endian = '>'
    else:
        return None

    # Read IFD offset
    ifd_offset = struct.unpack(endian + 'I', data[tiff_start + 4:tiff_start + 8])[0]
    abs_ifd = tiff_start + ifd_offset

    if abs_ifd + 2 >= len(data):
        return None

    # Read number of entries
    num_entries = struct.unpack(endian + 'H', data[abs_ifd:abs_ifd + 2])[0]

    # Look for orientation tag (0x0112)
    for i in range(num_entries):
        entry_pos = abs_ifd + 2 + i * 12
        if entry_pos + 12 > len(data):
            break
        tag = struct.unpack(endian + 'H', data[entry_pos:entry_pos + 2])[0]
        if tag == 0x0112:  # Orientation tag
            value = struct.unpack(endian + 'H', data[entry_pos + 8:entry_pos + 10])[0]
            return value

    return None


def _apply_orientation(img: np.ndarray, orientation: int) -> np.ndarray:
    """Apply EXIF orientation transformation."""
    h, w = img.shape[:2]

    if orientation == 2:
        return np.flip(img, axis=1)
    elif orientation == 3:
        return np.rot90(img, k=2)
    elif orientation == 4:
        return np.flip(img, axis=0)
    elif orientation == 5:
        return np.flip(np.rot90(img, k=3), axis=1)
    elif orientation == 6:
        return np.rot90(img, k=1)
    elif orientation == 7:
        return np.flip(np.rot90(img, k=1), axis=1)
    elif orientation == 8:
        return np.rot90(img, k=3)

    return img


def resize_for_analysis(img: np.ndarray, max_dim: int = 1024) -> np.ndarray:
    """
    Resize image if larger than max_dim to improve processing speed.

    Mobile photos can be 4000x3000+, which is unnecessarily large for
    MediaPipe landmark detection. Resizing to 1024px maintains quality
    while significantly reducing processing time and memory usage.

    Args:
        img: Input image array
        max_dim: Maximum dimension (width or height)

    Returns:
        Resized image if larger than max_dim, otherwise original.
    """
    h, w = img.shape[:2]
    if max(h, w) <= max_dim:
        return img

    scale = max_dim / max(h, w)
    new_w = int(w * scale)
    new_h = int(h * scale)

    import cv2
    return cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)
