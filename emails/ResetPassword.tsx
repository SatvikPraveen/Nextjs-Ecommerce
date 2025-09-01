// emails/ResetPassword.tsx
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components'

interface ResetPasswordProps {
  name: string
  resetLink: string
}

export const ResetPassword = ({ name, resetLink }: ResetPasswordProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerText}>Password Reset</Text>
          </Section>

          <Section style={section}>
            <Text style={greeting}>Hi {name},</Text>
            
            <Text style={paragraph}>
              You recently requested to reset your password for your account. 
              Click the button below to reset it.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={resetLink}>
                Reset Password
              </Button>
            </Section>

            <Text style={paragraph}>
              If you didn't request a password reset, please ignore this email or 
              contact support if you have questions.
            </Text>

            <Text style={note}>
              This password reset link will expire in 24 hours.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              If you're having trouble with the button above, copy and paste the URL below into your web browser:
            </Text>
            <Text style={linkText}>{resetLink}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 40px',
  backgroundColor: '#000000',
}

const headerText = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#ffffff',
  margin: '0',
  textAlign: 'center' as const,
}

const section = {
  padding: '0 40px',
}

const greeting = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#333333',
  margin: '32px 0 16px',
}

const paragraph = {
  fontSize: '16px',
  color: '#555555',
  lineHeight: '24px',
  margin: '0 0 24px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#000000',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
}

const note = {
  fontSize: '14px',
  color: '#666666',
  fontStyle: 'italic',
  margin: '24px 0 0',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
}

const footer = {
  padding: '0 40px',
}

const footerText = {
  fontSize: '12px',
  color: '#999999',
  margin: '0 0 8px',
}

const linkText = {
  fontSize: '12px',
  color: '#666666',
  wordBreak: 'break-all' as const,
  margin: '0',
}

export default ResetPassword