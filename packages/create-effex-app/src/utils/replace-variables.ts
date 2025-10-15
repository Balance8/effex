export const replaceVariables = (content: string, variables: Record<string, string>): string => {
  let result = content

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value)
  }

  return result
}
