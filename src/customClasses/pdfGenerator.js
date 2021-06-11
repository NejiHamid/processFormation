import { saveAs } from 'file-saver'
import { pick, isArray } from 'lodash'

export default class PdfGenerator {
  constructor(gapi, gdocsTemplateId, templateFromStore, currentFormation, pdfName, action, emails = null) {
    this.currentFormation = currentFormation
    this.blobReader = new FileReader()
    this.copiedFileFromGdocsAsBlob = null
    this.pdfReader = new FileReader()
    this.gdocsTemplateId = gdocsTemplateId
    this.pdfBlob = null
    this.valuesToInsert = []
    this.pdfName = pdfName
    this.newFileId = null
    this.templateFromStore = templateFromStore
    this.gapi = gapi
    this.action = action
    this.allowedActions = ['email', 'pdf']
    this.validateAction()
    this.emails = emails
    this.errors = []
  }

  async generatePdf() {
    console.log(this.gdocsTemplateId)

    this.buildValueToInsertFromCurrentFormationWithTemplateFromStore()
    await this.copyFileFromGdocs()
    this.blobReader.readAsText(this.copiedFileFromGdocsAsBlob)
    this.blobReader.onloadend = async () => {
      await this.replaceValuesinCopiedFile()
      await this.downloadNewFileAsPdfFromGdrive()
      switch (this.action) {
        case 'email': this.sendMail()
          break
        case 'pdf': this.saveNewFileInBrowserAsPdf()
          break
        default:
          break
      }
      this.gapi.gdrive.deleteFile(this.newFileId)
    }
  }

  async generatePdfGlobal(formations) {
    console.log(this.gdocsTemplateId)
    await this.copyFileFromGdocs()
    this.blobReader.readAsText(this.copiedFileFromGdocsAsBlob)

    this.blobReader.onloadend = async () => {
      const ObjectdocumentFromBlob = JSON.parse(this.blobReader.result)
      this.newFileId = ObjectdocumentFromBlob.id
      formations.forEach( async(formation) => {
        await this.updateGlobalTemplate()
        await this.replaceValuesInGlobalTemplate(formation)       
        
      })
      //await this.downloadNewFileAsPdfFromGdrive()
      //await this.sendMail()
      //this.gapi.gdrive.deleteFile(this.newFileId)
    }
  }

  async updateGlobalTemplate(){
    console.log(await this.gapi.gdocs.getDoc(this.newFileId))
    await this.gapi.gdocs.addContent(this.newFileId,this.buildValuesTemplateToReplace())
    console.log(await this.gapi.gdocs.getDoc(this.newFileId))
  }

  async replaceValuesInGlobalTemplate(formation){
    this.currentFormation = formation
    this.buildValueToInsertFromCurrentFormationWithTemplateFromStore()
    await this.replaceValuesinCopiedFile()
  }
  async copyFileFromGdocs() {
    this.copiedFileFromGdocsAsBlob = await this.gapi.gdrive.copyFile(this.gdocsTemplateId)
    return Promise.resolve()
  }
  async replaceValuesinCopiedFile() {
    const ObjectdocumentFromBlob = JSON.parse(this.blobReader.result)
    this.newFileId = ObjectdocumentFromBlob.id
    return this.gapi.gdocs.replaceValues(this.newFileId, this.valuesToInsert)
  }

  async downloadNewFileAsPdfFromGdrive() {
    console.log('downloadNewFileAsPdfFromGdrive')
    this.pdfBlob = await this.gapi.gdrive.downloadDocsAsPDF(this.newFileId)
    return Promise.resolve()
  }

  async saveNewFileInBrowserAsPdf() {
    this.pdfReader.readAsDataURL(this.pdfBlob)
    saveAs(this.pdfBlob, this.pdfName)
  }
  async sendMail() {
    this.pdfReader.readAsDataURL(this.pdfBlob)
    this.pdfReader.onloadend = () => {
      let base64data = this.pdfReader.result
      base64data = base64data.split('base64,')[1].replace(/=+$/, '')
      this.emails.forEach(email => {
        this.gapi.gmail.sendEmail(email.adress, email.objet, email.message, base64data)
          .catch(err => this.errors.push(err))
      })
    }
  }

  buildValueToInsertFromCurrentFormationWithTemplateFromStore() {
    for (let [key, value] of Object.entries(this.templateFromStore)) {
      console.log(key)
      let [sheet, sheetKey, propertiesToKeep] = value.split('.')
      propertiesToKeep = JSON.parse(propertiesToKeep)
      const functionToApply = this.getFunctionToApply(propertiesToKeep)
      try {
        // TODO
        const data = this.currentFormation[sheet][`${sheetKey}`]
        const arrayOfStringObject = data.map(functionToApply)
        this.valuesToInsert.push({
          text: key,
          replace: arrayOfStringObject.join('\n')
        })
      } catch (error) {
        console.log("Erreur !")
        console.log(error)
        this.valuesToInsert.push({
          text: key,
          replace: ''
        })
        this.errors.push(error)
      }
    }
  }

  /**
   * Fonction utilisée pour préparer les données template à remplacer dans une nouvelle ligne du template global
   */
  buildValuesTemplateToReplace(){
    let templateValues =[]
    for (let [key, value] of Object.entries(this.templateFromStore)) {
      templateValues.push({
        text : key,
        number : key.length
      })
    }
    return templateValues
  }

  getFunctionToApply(propertiesToKeep) {
    if (isArray(propertiesToKeep)) {
      return (obj) => {
        const objectWithSelectedProperties = pick(obj, propertiesToKeep)
        const values = Object.values(objectWithSelectedProperties)
        const objectWithSelectedPropertiesAsString = values.join('|')
          .replace('[', ' ')
          .replace(']', ' ')
          .replace('"', ' ')
        // HERE MODIFY THE STRING RETURN
        return objectWithSelectedPropertiesAsString
      }
    } else {
      return (obj) => obj[propertiesToKeep]
    }
  }
  validateAction() {
    if (!this.allowedActions.includes(this.action)) {
      throw new Error('unsupported action')
    }
  }
}
