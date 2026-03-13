export function formatCollaboratorsLabel(collaboratorsCount: number): string {
  const isSingle = collaboratorsCount === 1;
  return isSingle ? '1 collaborator' : `${collaboratorsCount} collaborators`;
}
