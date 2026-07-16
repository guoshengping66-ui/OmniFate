import { EasternHomeExperience } from "@/components/marketing-growth/EasternHomeExperience"
import { HomeAuthRedirect } from "@/components/marketing-growth/HomeAuthRedirect"

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <>
      <EasternHomeExperience locale={locale} />
      <HomeAuthRedirect />
    </>
  )
}
