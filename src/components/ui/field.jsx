function Field({ id, label, error, required = false, children }) {
  return (
    <div className="min-w-0 space-y-2">
      <label
        htmlFor={id}
        className="block text-[0.8125rem] leading-5 font-medium text-muted-foreground"
      >
        {label}
        {required && (
          <span className="ml-1 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error.message}
        </p>
      )}
    </div>
  )
}

export { Field }
