interface PageHeaderProps {
  title: string
  description?: string
  className?: string
}

export default function PageHeader({ title, description, className = "" }: PageHeaderProps) {
  return (
    <section className={`bg-muted py-16 ${className}`}>
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
        {description && <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">{description}</p>}
        
      </div>
    </section>
  )
}

