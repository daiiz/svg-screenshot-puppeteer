require('dotenv').config()

const openurl = require('openurl')
const {google} = require('googleapis')
const {OAuth2Client} = require('google-auth-library')
const fs = require('fs')
const readline = require('readline')

const clientId = process.env.client_id
const clientSecret = process.env.client_secret
const redirectUrl = process.env.redirect_url

const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl)
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: 'https://www.googleapis.com/auth/userinfo.email'
})
const tokenFilePath = `./keys/svg-screenshot-token.json`

export function oauth (callback) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  console.log('Authorize this app by visiting this url: ', authUrl)
  openurl.open(authUrl)

  rl.question('Enter the code from that page here: ', code => {
    rl.close()
    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        console.log('Error while trying to retrieve access token', err)
        return
      }
      oauth2Client.credentials = token
      // tokenを保存しておく
      // svg-screenshot-api.jsが参照する
      fs.writeFileSync(tokenFilePath, JSON.stringify(token, null, '  '))

      if (callback) callback()
    })
  })
}

export async function checkToken () {
  try {
    fs.statSync(tokenFilePath)
  } catch (err) {
    return false
  }

  // tokenの期限確認して、切れていれば更新する
  const token = JSON.parse(fs.readFileSync(tokenFilePath))
  const now = new Date().getTime()
  if (token.expiry_date - now < 0) {
    // access_tokenの期限切れ
    // refresh_tokenを用いて新しいaccess_tokenを取得する
    try {
      const newToken = await updateAccessToken(token)
      // tokenファイルを更新する
      fs.writeFileSync(tokenFilePath, JSON.stringify(newToken, null, '  '))
      return true
    } catch (err) {
      return false
    }
  }
  return true
}

const updateAccessToken = async (token) => {
  oauth2Client.credentials = token
  const newTokens = await oauth2Client.refreshAccessToken()
  console.log('access_token has been updated successfully.')
  return newTokens.credentials
}

