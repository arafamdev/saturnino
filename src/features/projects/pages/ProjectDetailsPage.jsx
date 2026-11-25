import { useParams } from 'react-router'

function ProjectDetailsPage() {
  const { projectId } = useParams()

  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">Project Details</h1>

      <p className="text-muted-foreground">Project ID: {projectId}</p>
    </section>
  )
}

export default ProjectDetailsPage
