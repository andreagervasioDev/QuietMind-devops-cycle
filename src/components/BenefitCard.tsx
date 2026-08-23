interface BenefitCardProps {
  icon: string;
  title: string;
  description: string;
}

export function BenefitCard({ icon, title, description }: BenefitCardProps) {
  return (
    <div className="rounded-2xl border border-sage-100 bg-white/60 p-5 dark:border-sage-800 dark:bg-sage-900/40">
      <div className="text-3xl" aria-hidden="true">
        {icon}
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold text-sage-800 dark:text-sage-100">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-sage-600 dark:text-sage-300">{description}</p>
    </div>
  );
}
