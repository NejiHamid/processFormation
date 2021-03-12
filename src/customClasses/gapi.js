/**
 * Module qui permet de gérer les différents services google
 */

/**
 * Classe maitresse qui est exposée pour l'instance vue, elle est composée de plusieurs classe représentant les différents
 * services google.
 */

class Gapi {
  /** @param {Object} gapi un objet de la librairie gapi injecté dans le index.html
   * @param {Object} config un objet contenant la configuration pour le client gapi
   */
  constructor (gapi, config) {
    this.gapi = gapi
    this.config = config
    this.token = null
    this.gdocs = null
    this.gsheet = null
    this.gdrive = null
    this.gmail = null
  }
  initClients () {
    /** Methode qui permet d'initialiser tous les services googles nécessaires à l'application
     * utilisation de la méthode d'authentification auth2
     */
    this.gapi.load('client:auth2', () => {
      this.gapi.client.init(this.config).then(() => {
        this.token = this.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token
        this.gdocs = new Gdocs(this.gapi.client.docs)
        this.gsheet = new Gsheet(this.gapi.client.sheets)
        this.gdrive = new Gdrive(this.gapi.client.drive, this.token, 'AIzaSyB16XeS_W_rrxuWTXTKjMO0WdEP1Yj0KPE')
        this.gmail = new Gmail(this.gapi.client.gmail, this.token, 'AIzaSyB16XeS_W_rrxuWTXTKjMO0WdEP1Yj0KPE')
      })
    })
  }
}

/**
 * Classe qui gère les accès avec google docs
 */
class Gdocs {
  /** @param {Object} initialGapiClient un client gapi.client.docs initialisé */
  constructor (initialGapiClient) {
    this.client = initialGapiClient
  }
  replaceValues (docId, values) {
    /** Execute une requete vers docs API qui permet de remplacer plusieurs valeurs suivant un pattern
     * @param {String} docId identifiant du document docs
     * @param {Array} values tableau d'objet  {text: 'text', replace:'text'}
     * @return {Promise} ajax request vers google docs
     */
    const requests = values.map(v => this.replaceAllText(v))
    return this.batchUpdate(docId, requests)
  }
  batchUpdate (docId, requests) {
    /** @private methode qui execute une methode batchUpdate vers google docs
     *
     * @param {String} docId identifiant du document docs
     * @param {Array} requests tableau d'objet request google doc api ref: https://developers.google.com/docs/api/reference/rest/v1/documents/request
     * @return {Promise} ajax request vers google docs
     */
    console.log(docId + ' : ' + requests)
    return this.client.documents.batchUpdate({
      documentId: docId,
      resource: {
        requests
      }
    })
  }
  replaceAllText (value) {
    /** @private methode construit un objet requests pour l'api docs batchUpdate ref : https://developers.google.com/docs/api/reference/rest/v1/documents/request#replacealltextrequest
     * @param {Object} value {text: 'text', replace:'text'}
     * @return {Object} { "replaceText": string,
     *                    "containsText": {
     *                                      object (SubstringMatchCriteria)
     *                                     }
     *                  }
     */
    return {
      replaceAllText: {
        containsText: {
          text: value.text,
          matchCase: true
        },
        replaceText: value.replace
      }
    }
  }
  async fetchAlltext (docId) {
    /** methode qui permet de récupérer tout le texte du docuement
     * @param {String} docId identifiant du document
     *  @return {String} retour de methode ParseDocs
     */
    const response = await this.client.documents.get({
      documentId: docId
    })
    const document = response.result
    return this.parseDocs(document)
  }
  parseDocs (document) {
    /**
     * @param {Object} document response de client.document.get => objet doc api
     * @return {String} de tout le texte du document
     */
    const content = document.body.content
    let text = ''
    content.forEach(o => {
      try {
        o.paragraph.elements.forEach(elm => {
          text = text + elm.textRun.content
        })
      } catch (error) {

      }
    })
    return text
  }
}

/**
 * Classe qui gère les accès avec google drive
 * Ici utilisation des API KEY/Token au lieu Oauth2
 */
class Gdrive {
  /**
   * @param {Object} initialGapiClient un client gapi.client.drive initialisé
   * @param {String} token un token pour communiuqer avec l'api drive
   * @param  {String} apiKey une clé api pour communiquer avec l'api drive
   */

  constructor (initialGapiClient, token, apiKey) {
    this.client = initialGapiClient
    this.url = `https://www.googleapis.com/drive/v3/files/`
    this.token = token
    this.apiKey = apiKey
    this.requestsHeaders = {
      Authorization: `Bearer ${this.token}`
    }
  }
  async downloadDocsAsPDF (docId) {
    /** Permet de télécharger un document google doc en PDF
     * @param {String} docId identifiant du document google doc
     * @return {Promise} avec un blob contenant le PDF
     */
    const url = `${this.url}${docId}/export?mimeType=application%2Fpdf&key=${this.apiKey}`
    const params = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/pdf'
      }
    }
    const response = await fetch(url, params)
    return response.blob()
  }
  async copyFile (docId) {
    const url = `${this.url}${docId}`
    const params = {
      method: 'POST',
      headers: this.requestsHeaders
    }
    const response = await fetch(url + '/copy', params)
    return response.blob()
  }
  async deleteFile (docId) {
    const url = `${this.url}${docId}`
    const params = {
      method: 'DELETE',
      headers: this.requestsHeaders
    }
    return fetch(url, params)
  }
}

/** Classe qui gère permet de récupérer les données depuis
 * la feuille de formation
 */
class Gsheet {
  /**
   * @param {Gapi} initialGapiClient a gapiSheet client initialized
   */
  constructor (initialGapiClient) {
    this.client = initialGapiClient
  }
  async writeDataTo (docId, rangeObject) {
    const body = {
      valueInputOption: 'RAW',
      data: rangeObject
    }
    return this.client.spreadsheets.values.batchUpdate({
      spreadsheetId: docId
    }, body)
  }
  buildRangeObject (data, sheet) {
    const lastRow = data.length + 1
    const lastColumns = this.convertNumberToString(Object.keys(data[0]).length + 1)
    const values = data.reduce((acc, row) => {
      return [...acc, Object.values(row)]
    }, [])
    return {
      'range': `${sheet}!A2:${lastColumns}${lastRow}`,
      'majorDimension': 'ROWS',
      'values': values
    }
  }
  async fetchDataFrom (docId) {
    /**
     * Methode haut niveau qui permet de récupérer toutes les données
     * depuis un document google sheet et de transformer en un tableau
     * d'objet
     * @param {String} docId l'id de la feuille à récupérer
     * @return {Array} tableau d'objets {<nomFeuille>: [{rowObject}}]}
     */
    const response = await this.client.spreadsheets.get({
      spreadsheetId: docId,
      includeGridData: true
    })
    const sheets = response.result.sheets
    return this.extractData(sheets)
  }
  extractData (sheets) {
    /** @private Methode qui permet d'extraire les données de la réponse à la methode get du client sheet
     * @param {Array} sheets tableau d'objet sheet
     * @return {object} un tableau d'objet.
     */
    return sheets.reduce((acc, sheet) => {
      const title = sheet.properties.title
      const data = this.parseSheet(sheet)
      acc[title] = data
      return acc
    }, {})
  }

  parseSheet (sheet) {
    /** @private Methode qui permet d'extraire les données d'un feuille d'un document google sheet
     * @param {Object} sheet un objet sheet du client sheet de google api
     * @return {Array} tableau d'objet.
     */

    const headers = this.fetchHeaders(sheet.data)
    let data = sheet.data[0].rowData.slice(1)
    let result = []
    data.forEach((row, index) => {
      const rowJson = this.valueToJson(row, headers)
      const rowJsonValues = Object.values(rowJson)
      if (!rowJsonValues.every(v => v === '')) {
        result.push({ pk: index, ...rowJson })
      }
    })
    return result
  }
  fetchHeaders (sheetData) {
    /** @private methode qui permet de récupérer la première ligne et extrait les valeurs
     * @param {Object} sheetData un objet qui contient les données d'une feuille
     * @return {Array} un tableau de valeur correspondant aux libellé de la première ligne de la feuille
     */
    return sheetData[0].rowData[0].values.map(v => v.formattedValue).filter(v => v !== undefined)
  }
  valueToJson (row, headers) {
    /** @private methode qui transforme une ligne en objet JSON {<colonne>: <valeurLigne>, range:<A1>}
     * @param {Object} row un objet représentant une ligne
     * @param {Object} headers objet qui contient les valeurs des entêtes des colonnes de la feuille
     * @return {Array} tableau d'objet {<colonne>: <valeurLigne>, range:<A1>}
     */
    return row.values.reduce((acc, v, colIndex) => {
      try {
        const col = headers[colIndex]
        const row = v.formattedValue
        if (col !== undefined) {
          acc[col] = row === undefined ? '' : row
        }
      } catch (error) { }
      return acc
    }, {})
  }
  convertNumberToString (number) {
    /** @private methode qui permet de coonvertir un nombre en string
     * p.ex 1 => A
     * @param {Number} number nombre de type int ou string
     * @return {String} equivalent @param number
     */
    return String.fromCharCode(65 + number)
  }
}

class Gmail {
  /**
   * @param {Gapi} initialGapiClient a gapiSheet client initialized
   */
  constructor (initialGapiClient, token, apiKey) {
    this.client = initialGapiClient
    this.token = token
    this.apiKey = apiKey
    this.requestsHeaders = {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'message/rfc822'
    }
  }
  sendEmail (to, subject, message, data) {
    /** @param {String} to adresse email du destinataire
     *@param {String} adresse email du destinataire
     * @param {String} subject sujet du email
     * @param {String} message messsage du email
     * @param {base64} data pdf à envoyer
     */
    let email = this.buildEmail(to, subject, message, data)
    const url = `https://www.googleapis.com/upload/gmail/v1/users/me/messages/send?uploadType=multipart`
    this.requestsHeaders['Content-Length'] = new TextEncoder().encode(email).length
    const params = {
      method: 'POST',
      headers: this.requestsHeaders,
      body: email
    }
    return fetch(url, params)
  }
  buildEmail (to, subject, message, data) {
    /** @param {String} adresse email du destinataire
     * @param {String} subject sujet du email
     * @param {String} message messsage du email
     * @param {base64} data pdf à envoyer
     * @return {String} représentant un email au format rfc 822 */
    return `Content-Type: multipart/mixed; boundary=foo_bar_baz;\r\nMIME-Version: 1.0\r\nFrom: me\r\nTo: ${to}\r\nSubject: ${subject}\r\n\r\n--foo_bar_baz\r\nContent-Type: text/plain; charset="UTF-8"\r\nContent-Transfer-Encoding: 8bit\r\n\r\n${message}\r\n\r\n--foo_bar_baz\r\nContent-Type: application/pdf\r\nMIME-Version: 1.0\r\nContent-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename="example.pdf"\r\n\r\n${data}\r\n\r\n--foo_bar_baz`
  }
}

export default Gapi
