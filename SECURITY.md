# Security Policy

## Supported Versions

Currently, the following versions of NoIDchat are being supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in NoIDchat, please follow these steps:

1. **Do Not** open a public issue
2. Email the security team at: security@noidchat.com
3. Include detailed information about the vulnerability:
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- You will receive an acknowledgment within 48 hours
- We will investigate and provide updates every 5 business days
- We aim to patch critical vulnerabilities within 7 days
- You will be credited in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices

When deploying NoIDchat:

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, unique JWT secrets
   - Rotate secrets regularly

2. **Database**
   - Use strong database passwords
   - Enable SSL for database connections
   - Regular backups

3. **API Security**
   - Keep dependencies updated
   - Monitor for security advisories
   - Use HTTPS in production
   - Configure CORS properly

4. **Docker**
   - Use official base images
   - Keep images updated
   - Don't run containers as root
   - Scan images for vulnerabilities

5. **AI Features**
   - Keep Llama API endpoint secure
   - Monitor AI responses for inappropriate content
   - Set rate limits

## Known Security Considerations

- AI moderation is not 100% accurate - manual review may be needed
- File uploads should be scanned for malware in production
- Implement IP-based rate limiting for API endpoints
- Regular security audits are recommended

Thank you for helping keep NoIDchat secure!
