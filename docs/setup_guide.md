# Setup Guide - AI Job Search Assistant

## Prerequisites

### Required Accounts & Services
- **n8n Instance**: Self-hosted or cloud (n8n.cloud)
- **Notion Workspace**: Free tier sufficient
- **Google Drive**: Personal Google account
- **pdflayer Account**: Free tier (100 conversions/month)
- **OpenAI Account**: API access with billing enabled

### Estimated Setup Time
- **Basic Setup**: 2-3 hours
- **Testing & Validation**: 1-2 hours  
- **Total**: 3-5 hours

## Step 1: Notion Database Setup

### Create Job Tracking Database

1. **Create New Database** in Notion
2. **Add Required Properties**:
   - `Title` (Title) - Job position title
   - `Company` (Rich Text) - Company name
   - `Priority` (Select) - Options: High, Medium, Low
   - `Match Score` (Number) - Scale: 1-10
   - `Status` (Select) - Options: New, Applied, Interview, Offer, Rejected
   - `Description` (Rich Text) - Job description
   - `Job URL` (URL) - Link to original posting
   - `Date Found` (Date) - Date job was found
   - `Resume Status` (Select) - Options: Not Generated, Generated
   - `Resume File (View)` (URL) - Link to resume in google drive
   - `Resume File (Download)` (URL) - Link to resume download link
   - `Resume Generated Date` (Date) - Date resume was generated
   - `Tailoring Notes` (Rich Text) - Notes on how resume was tailored
   - `Resume Word Count` (Number) - Number of words on resume

3. **Create Notion Integration**
   - Go to https://developers.notion.com/
   - Create new integration
   - Copy integration token
   - Share database with integration

### Sample Database Entry
```
Title: Frontend Engineer Intern
Company: Vercel  
Priority: High
Match Score: 9
Status: New
Description: [Paste job description]
Job URL: https://vercel.com/careers/
Date Found: 09/10/2025
Resume Status: Not Generated...
```

## Step 2: API Configuration

### Notion API Setup
```bash
# Get your integration token from:
# https://www.notion.so/my-integrations

NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### pdflayer API Setup
```bash  
# Sign up at https://pdflayer.com/
# Free tier: 100 PDF conversions/month

PDFLAYER_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### OpenAI API Setup
```bash
# Get API key from https://platform.openai.com/api-keys
# Recommended model: gpt-4.1-mini (cost-effective)

OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Google Drive API Setup

1. **Create Project** in Google Cloud Console
2. **Enable Drive API**
3. **Create OAuth2 Credentials**
4. **Configure OAuth Consent Screen**
5. **Add Credentials** to n8n

## Step 3: n8n Configuration

### Environment Variables

Add to your n8n environment:

```bash
# .env file or system environment
NOTION_TOKEN=your_notion_integration_token
PDFLAYER_API_KEY=your_pdflayer_api_key
OPENAI_API_KEY=your_openai_api_key
```

### Import Workflow

1. **Download** `Resume_Generator.json`
2. **Import** into n8n
3. **Update Node IDs**:
   - Notion database ID
   - Google Drive folder ID  
   - Credential references

### Configure Credentials

1. **Notion Credential**
   - Name: "Notion account"
   - Token: Your integration token

2. **OpenAI Credential**
   - Name: "OpenAI account"  
   - API Key: Your OpenAI API key

3. **Google Drive Credential**
   - Name: "Google Drive account"
   - OAuth2 setup with your credentials

## Step 4: Google Drive Setup

### Create Folder Structure
```
Google Drive/
└── Resumes/
    ├── Generated/     
```

### Get Folder ID
1. **Navigate** to your Resumes folder
2. **Copy URL**: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
3. **Extract ID**: The part after `/folders/`
4. **Add to Workflow**: Update Google Drive node configuration

## Step 5: Testing & Validation

### Test Individual Components

#### 1. Test Notion Connection
```bash
# In n8n, test "Get High Match Jobs" node
# Should return your database entries
```

#### 2. Test AI Resume Generation
```bash
# Run "Analyze Jobs for Tailoring" → "Basic LLM Chain"
# Verify resume content is generated
```

#### 3. Test PDF Generation
```bash
# Run HTML conversion → pdflayer HTTP request
# Check binary data output is present
```

#### 4. Test Google Drive Upload
```bash
# Run complete workflow end-to-end
# Verify PDF appears in Google Drive folder
```

### Validation Checklist

- [ ] Notion database contains test job entries
- [ ] Workflow runs without errors
- [ ] PDF files generated with correct naming
- [ ] Files uploaded to correct Google Drive folder
- [ ] Binary data flows properly between nodes
- [ ] AI-generated content is relevant and professional

## Step 6: Production Deployment

### Schedule Configuration
- **Trigger**: Daily at 7:00 AM (adjustable)
- **Limit**: 5 resumes per day (configurable)
- **Timeout**: 10 minutes per workflow execution

### Monitoring Setup
- **Enable n8n logging**: Monitor execution history
- **Set up alerts**: Email notifications for failures
- **Resource monitoring**: CPU and memory usage

### Cost Management
- **OpenAI**: ~$0.50 per resume (GPT-4.1-mini)
- **pdflayer**: Free tier sufficient for testing
- **Google Drive**: Free tier adequate
- **Total**: ~$15-25/month for 50 resumes

## Troubleshooting

### Common Issues

#### "Notion database not found"
- **Solution**: Check database ID and integration permissions
- **Verify**: Database is shared with your integration

#### "Binary data undefined" 
- **Solution**: Check pdflayer HTTP request response format
- **Setting**: Response Format = "file", Output Property = "data"

#### "Google Drive permission denied"
- **Solution**: Re-authenticate OAuth2 credentials
- **Check**: Drive API enabled in Google Cloud Console

#### "AI generation fails"
- **Solution**: Check OpenAI API key and billing status
- **Fallback**: Ensure model (gpt-4.1-mini) is available

### Performance Optimization

#### Speed Improvements
- **Batch Processing**: Limit concurrent executions
- **Caching**: Store generated content temporarily
- **Retries**: Configure automatic retry for transient failures

#### Cost Reduction
- **Model Selection**: Use GPT-4.1-mini instead of GPT-4
- **Prompt Optimization**: Minimize token usage
- **Filtering**: Process only high-priority jobs

## Support

### Getting Help
1. **Check Logs**: n8n execution history for detailed errors
2. **Review Documentation**: API documentation for each service
3. **Community Support**: n8n community forum
4. **GitHub Issues**: Report bugs or request features

### Additional Resources
- **n8n Documentation**: https://docs.n8n.io/
- **Notion API Docs**: https://developers.notion.com/
- **pdflayer Docs**: https://pdflayer.com/documentation
- **OpenAI API Docs**: https://platform.openai.com/docs

---

**Next Step**: Once setup is complete, proceed to testing with sample job entries to validate the complete pipeline.