import { defaultIds } from './config'

export const sampleData = {
  projectId: defaultIds.projectId,
  customerId: defaultIds.customerId,
  prompt:
    'Generate a friendly onboarding email that references the user name, company name, and a call to action link.',
  template: `<section>
  <h1>Welcome, {{user_name}}!</h1>
  <p>Thanks for joining <strong>{{company_name}}</strong>. We built this template to help you get started quickly.</p>
  <ul>
    <li>Your workspace: {{workspace_url}}</li>
    <li>Next step: {{primary_call_to_action}}</li>
  </ul>
  <p>If you have questions, reply to this email and our AI assistant will help.</p>
  <p>Cheers,<br />The {{company_name}} Team</p>
</section>`
}
