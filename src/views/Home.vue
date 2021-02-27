<template>
  <v-container fluid>
    <h1>Mon Projet</h1>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title primary-title v-if="isSignIn">
            Heureux de vous revoir {{currentUser.fullName}} 😀
          </v-card-title>

        </v-card>

      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <SelectProject/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import SelectProject from '@/components/SelectProject'

export default {
  components: {
    SelectProject
  },
  data: () => ({

  }),
  methods: {
    ...mapActions([
      'setUser'
    ])
  },
  computed: {
    ...mapGetters([
      'currentUser',
      'isSignIn'
    ])
  }
}
</script>
