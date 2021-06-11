import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'
import { groupBy, maxBy, omit, mapValues } from 'lodash'

Vue.use(Vuex)

// here add state in reducer to persist in local storage
const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  reducer: state => ({
    data: state.data,
    sheetId: state.sheetId,
    projects: state.projects
  })
})
export default new Vuex.Store({
  plugins: [vuexLocal.plugin],
  state: {
    app: {
      1.0: {
        template: {
          /* format dépend de la feuille:
          pour fiche de formations :
          {{cle a chercher dans le gdcos template}} : Fiches de formations.0."<nom_colonne>"
          Pour Elements des fiches de formation :
          {{cle a chercher dans le gdcos template}} : Elements des fiches de formation."<nom_colonne>".["champ1","champ2"]
          */
          '{{Code de fiche de formation}}': `Fiches de formations.0."Code de fiche de formation"`,
          '{{Duree}}': `Fiches de formations.0."Duree"`,
          '{{Description de fiche de formation}}': `Fiches de formations.0."Description de fiche de formation"`,
          '{{Code tarifaire}}': `Fiches de formations.0."Code tarifaire"`,
          '{{Objectifs}}': `Elements des fiches de formation.Objectif.["Numero sequentiel","Description de l'element", "Etat de l'element"]`,
          '{{Déroulement / plan de travail}}': `Elements des fiches de formation.Déroulement / plan de travail.["Numero sequentiel","Description de l'element", "Etat de l'element"]`,
          '{{Support de formation}}': `Elements des fiches de formation.Support de formation.["Numero sequentiel","Description de l'element", "Etat de l'element"]`,
          '{{Public visé}}': `Elements des fiches de formation.Public visé.["Numero sequentiel","Description de l'element", "Etat de l'element"]`,
          '{{Pré-requis stagiaire référent}}': `Elements des fiches de formation.Pré-requis stagiaire référent.["Numero sequentiel","Description de l'element", "Etat de l'element"]`,
          '{{Pré-requis formateur référent}}': `Elements des fiches de formation.Pré-requis formateur référent.["Numero sequentiel","Description de l'element", "Etat de l'element"]`,
          '{{Actions habituelles}}': `Elements des fiches de formation.Actions habituelles.["Numero sequentiel","Description de l'element", "Etat de l'element"]`,
          '{{Hors formation}}': `Elements des fiches de formation.Hors formation.["Numero sequentiel","Description de l'element", "Etat de l'element"]`,
          '{{Objectif}}': `Indicateurs.0."Objectif"`
        },
        mapping: {
          nameSheetFicheFormation: 'Fiches de formations',
          nameSheetDetailsFormation: 'Elements des fiches de formation',
          nameSheetIndicateurs: 'Indicateurs',
          nameColumnJoinWithSheetDetailsFormation: 'Code de fiche de formation',
          nameColumnGroupByDetailFormation: 'Categorie d\'element',
          columnsToComplete: { sheet: 'Fiches de formations', columns: ['Version', 'Code tarifaire', 'Code de fiche de formation'] },
          labelFicheFormation: { sheet: 'Fiches de formations', column: 'Libelle de fiche de formation' }
        },
        detailFormationMapping: {
          hideColumns: ['Version', 'Code tarifaire', 'Code de fiche de formation', "Categorie d'element"],
          buttonsSelect: {
            "Etat de l'element": [
              { value: 'AF', label: 'A Faire' },
              { value: 'EC', label: 'En cours' },
              { value: 'T', label: 'Terminé' }
            ]
          }
        },
        templateGlobal: {
          /* format dépend de la feuille:
          pour fiche de formations :
          {{cle a chercher dans le gdcos template}} : Fiches de formations.0."<nom_colonne>"
          Pour Elements des fiches de formation :
          {{cle a chercher dans le gdcos template}} : Elements des fiches de formation."<nom_colonne>".["champ1","champ2"]
          */
          '{{Code tarifaire}}': `Fiches de formations.0."Code tarifaire"`,
          '{{Code de fiche de formation}}': `Fiches de formations.0."Code de fiche de formation"`,
          '{{Description de fiche de formation}}': `Fiches de formations.0."Description de fiche de formation"`,
          '{{Duree}}': `Fiches de formations.0."Duree"`
        },
        mappingGlobal: {
          nameSheetFicheFormation: 'Fiches de formations',
          nameSheetDetailsFormation: 'Elements des fiches de formation',
          nameColumnJoinWithSheetDetailsFormation: 'Code de fiche de formation',
          nameColumnGroupByDetailFormation: 'Categorie d\'element',
          columnsToComplete: { sheet: 'Fiches de formations', columns: ['Version', 'Code tarifaire', 'Code de fiche de formation'] },
          labelFicheFormation: { sheet: 'Fiches de formations', column: 'Libelle de fiche de formation' }
        },
        detailFormationsGlobalMapping: {
          hideColumns: ['Version', 'Code tarifaire', 'Code de fiche de formation', "Categorie d'element"],
          buttonsSelect: {
            "Etat de l'element": [
              { value: 'AF', label: 'A Faire' },
              { value: 'EC', label: 'En cours' },
              { value: 'T', label: 'Terminé' }
            ]
          }
        }
      }
    },
    version: 1,
    data: [],
    user: {
      fullName: ''
    },
    projects: [],
    selectedProject: {
      nom: '',
      sheetId: '',
      templateId: '',
      templateGlobalId: ''
    }
  },
  getters: {
    currentProject: state => {
      return state.selectedProject
    },
    currentTemplate: (state, getters) => {
      const version = parseInt(state.version)
      console.log(state.app[version].template);
      return state.app[version].template
    },
    currentTemplateGlobal: (state, getters) => {
      const version = parseInt(state.version)
      return state.app[version].templateGlobal
    },
    currentGdocsTemplate: state => {
      return state.selectedProject.templateId
    },
    currentGdocsTemplateGlobal: state => {
      return state.selectedProject.templateGlobalId
    },
    currentSheetsName: state => {
      const sheetsName = Object.keys(state.data)
      return sheetsName
    },
    currentUser: state => {
      return state.user
    },
    currentData: state => {
      return state.data
    },
    currentVersion: state => {
      return state.version
    },
    currentMapping: state => {
      const version = parseInt(state.version)
      return state.app[version].mapping
    },
    currentMappingGlobal: state => {
      const version = parseInt(state.version)
      return state.app[version].mappingGlobal
    },
    currentDetailFormationMapping: state => {
      const version = parseInt(state.version)
      return state.app[version].detailFormationMapping
    },
    currentDetailFormationsGlobalMapping: state => {
      const version = parseInt(state.version)
      return state.app[version].detailFormationsGlobalMapping
    },
    currentNameColumnJoinWithSheetDetailsFormation: (state, getters) => {
      return getters.currentMapping.nameColumnJoinWithSheetDetailsFormation
    },
    currentNameSheetFicheFormation: (state, getters) => {
      return getters.currentMapping.nameSheetFicheFormation
    },
    currentNameSheetDetailsFormation: (state, getters) => {
      return getters.currentMapping.nameSheetDetailsFormation
    },
    currentNameSheetIndicateurs: (state, getters) => {
      return getters.currentMapping.nameSheetIndicateurs
    },
    currentFormation: (state, getters) => valueJoinWithSheetDetailsFormation => {
      const sheetFicheFormation = getters.currentNameSheetFicheFormation
      const sheetDetailsFormation = getters.currentNameSheetDetailsFormation
      const sheetIndicateurs = getters.currentNameSheetIndicateurs
      const valueColumnJoinWithSheetDetailsFormation = getters.currentMapping.nameColumnJoinWithSheetDetailsFormation
      const valueColumnGroupByDetailFormation = getters.currentMapping.nameColumnGroupByDetailFormation
      const filteredByValueJoinWithSheetDetailsFormation = state.data[sheetDetailsFormation].filter(obj => obj[valueColumnJoinWithSheetDetailsFormation] === valueJoinWithSheetDetailsFormation)

      const detailFormationGroupBy = groupBy(filteredByValueJoinWithSheetDetailsFormation, valueColumnGroupByDetailFormation)
      const formation = {}
      formation[sheetFicheFormation] = {
        '0': state.data[sheetFicheFormation].filter(obj => obj[valueColumnJoinWithSheetDetailsFormation] === valueJoinWithSheetDetailsFormation)
      }
      formation[sheetDetailsFormation] = detailFormationGroupBy
      console.log(formation);
      return formation
    },
    currentSheetId: state => {
      return state.selectedProject.sheetId
    },
    getProjectByName: state => projectName => {
      return state.listOfProjects.find(v => v.nom === projectName)
    },
    getColumnsForSheet: state => sheetName => {
      console.log('sheet',sheetName);
      const model = state.data[sheetName][0]
      return Object.keys(model)
    },
    getValuesGroupByColumns: state => (sheetName, columnName) => {
      return groupBy(state.data[sheetName], columnName)
    },
    getFieldsBySheetName: state => {
      const fieldsAvailablePerSheet = Object.keys(state.data).reduce((groupBySheet, sheet) => {
        if (!groupBySheet[sheet]) {
          groupBySheet[sheet] = Object.keys(state.data[sheet][0]).reduce((fields, name) => {
            if (!fields[name]) {
              fields[name] = ''
            }
            return fields
          }, {})
        }
        return groupBySheet
      }, {})
      return fieldsAvailablePerSheet
    },
    isSignIn: state => {
      return state.user.fullName !== ''
    },
    listOfProjects: state => {
      return state.projects
    }
  },
  mutations: {
    user (state, user) {
      state.user = user
    },
    version (state, version) {
      state.version = version
    },
    data (state, data) {
      state.data = data
    },
    selectedProject (state, project) {
      state.selectedProject = project
    },
    projects (state, url) {
      state.projects.push(url)
    },
    addToData (state, payload) {
      const { sheetName, value } = payload
      const { pk } = maxBy(state.data[sheetName], 'pk')
      const newPk = pk + 1
      state.data[sheetName].push({ pk: newPk, ...value })
    },
    pushUndefinedObject (state, payload) {
      const { sheetName, pk } = payload
      const objectToDelete = state.data[sheetName].find(v => v.pk === pk)
      const index = state.data[sheetName].map(v => v.pk).indexOf(pk)
      state.data[sheetName].splice(index, 1)
      const empty = mapValues(objectToDelete, () => '')
      state.data[sheetName].push(empty)
    },
    deleteFromData (state, payload) {
      const { sheetName, pk } = payload
      const index = state.data[sheetName].map(v => v.pk).indexOf(pk)
      state.data[sheetName].splice(index, 1)
    },
    updateMapping (state, newValue) {
      const version = parseInt(state.version)
      state.app[version].mapping = newValue
    },
    updateTemplating (state, newTemplating) {
      const version = parseInt(state.version)
      state.app[version].template = newTemplating
    },
    updateMappingGlobal (state, newValue) {
      const version = parseInt(state.version)
      state.app[version].mappingGlobal = newValue
    },
    updateTemplatingGlobal (state, newTemplating) {
      const version = parseInt(state.version)
      state.app[version].templateGlobal = newTemplating
    }
  },
  actions: {
    setUser ({ commit }, user) {
      commit('user', user)
    },
    async setData ({ commit, getters }) {
      if (getters.currentSheetId !== '') {
        const data = await this.$gapi.gsheet.fetchDataFrom(getters.currentSheetId)
        commit('data', data)
        try {
          commit('version', data['Meta-Donnees'][0]['Version Applicatif'])
        } catch (error) {
          commit('version', 1)
        }
      }
    },
    writeData ({ commit }, data) {
      commit('data', data)
    },
    clearData ({ commit }) {
      commit('data', [])
    },
    setSelectedProject ({ commit }, project) {
      commit('selectedProject', project)
    },
    addNewproject ({ commit }, project) {
      commit('projects', project)
    },
    async writeToSheet ({ state, getters }) {
      const sheetsName = getters.currentSheetsName
      const rangeObjects = []
      sheetsName.forEach(sheetName => {
        const data = state.data[sheetName].map(v => omit(v, 'pk'))
        const currentRangeObject = this.$gapi.gsheet.buildRangeObject(data, sheetName)
        rangeObjects.push(currentRangeObject)
      })
      return this.$gapi.gsheet.writeDataTo(getters.currentSheetId, rangeObjects)
    },
    async deleteFromData ({ commit, dispatch }, payload) {
      /** @param {Object} payload {sheetName : String , pk: Int}
       *
      */
      commit('pushUndefinedObject', payload)
      await dispatch('writeToSheet')
      await dispatch('setData')
      commit('deleteFromData', { sheetName: payload.sheetName, pk: '' })
    },
    addToData ({ commit, dispatch }, payload) {
      /** @param {Object} payload {sheetName : String , value: object}
       */
      commit('addToData', payload)
      return dispatch('writeToSheet')
    },
    setMapping ({ commit }, newMapping) {
      commit('updateMapping', newMapping)
    },
    setTemplate ({ commit }, newTemplating) {
      commit('updateTemplating', newTemplating)
    }
  }
})
