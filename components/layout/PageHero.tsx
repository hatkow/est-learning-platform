export default function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string
  title: string
  description?: string
}) {
  return (
    <div className="bg-est-700 text-white">
      <div className="container-x py-12">
        {eyebrow && <p className="text-sm font-bold text-est-100">{eyebrow}</p>}
        <h1 className="mt-1 text-3xl font-black md:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-white/90">{description}</p>}
      </div>
    </div>
  )
}
