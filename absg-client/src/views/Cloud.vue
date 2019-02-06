<template>
    <div>
        <v-btn slot="activator"
          class="ds-skinny-button"
          depressed
          :icon="$vuetify.breakpoint.smAndDown"
          @click="getUserData">
          <span v-if="$vuetify.breakpoint.mdAndUp">Load</span>
          <v-icon v-else>{{ labels.todayIcon }}</v-icon>

        </v-btn>
        <p>{{ directoryItems }}</p>
    </div>
</template>


<script>

// const { createClient } = require("webdav");
 
// const client = createClient(
//     "http://cloud.absolumentg.fr",
//     {
//         username: "absolumentg",
//         password: "@bsolument3G"
//     }
// );

export default  {
    data: () => ({
        directoryItems: [],
        authors: ['Olivier', 'Jocelyne', 'Denis', 'Alain', 'Annie'],
        items: []
    }),
    methods: {
        getUserData: async function() {
            // this.directoryItems = await client.getDirectoryContents("/")
        }
    }
}
</script>