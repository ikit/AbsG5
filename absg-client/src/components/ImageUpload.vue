<template>
    <div>
        <v-flex xs12 class="text-xs-center text-sm-center text-md-center text-lg-center" style="padding: 0">
            <img :src="imageUrl" height="150" v-if="imageUrl"/>
            <v-text-field label="Selectionnez une image" @click='pickFile' v-model='imageName' prepend-icon='fas fa-paperclip'></v-text-field>
            <input
                type="file"
                style="display: none"
                ref="image"
                accept="image/*"
                @change="onFilePicked"
            >
        </v-flex>
        <v-dialog v-model="dialog" max-width="290">
            <v-card>
                <v-card-title class="headline">Hello World!</v-card-title>
                <v-card-text>Image Upload Script in VUE JS
                    <hr>Yubaraj Shrestha
                    <br>http://yubarajshrestha.com.np/</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" flat="flat" @click.native="dialog = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>


<script>


export default {
    name: 'ImageUpload',
    data: () => ({
        title: "Image Upload",
        dialog: false,
		imageName: '',
		imageUrl: '',
		imageFile: ''
    }),

    methods: {
        pickFile () {
            this.$refs.image.click ()
        },

		onFilePicked (e) {
			const files = e.target.files
			if(files[0] !== undefined) {
				this.imageName = files[0].name
				if(this.imageName.lastIndexOf('.') <= 0) {
					return
				}
				const fr = new FileReader ()
				fr.readAsDataURL(files[0])
				fr.addEventListener('load', () => {
					this.imageUrl = fr.result
					this.imageFile = files[0] // this is an image file that can be sent to server...
				})
			} else {
				this.imageName = ''
				this.imageFile = ''
				this.imageUrl = ''
			}
		}
    }
}

</script>



<style lang="scss" scoped>
@import '../assets/global.scss';
h1 {
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    text-align: center;
    color: $primary;
    text-shadow: 0 -1px #000;
    text-shadow: 0 1px #aaa;
    font-size: 1.5em;
    font-family: "Comfortaa", sans-serif;
    font-weight: bold;
    margin: 10px 0;
}
.passage {
    height: 495px;
    overflow: hidden;
}
.citation {
    text-align: center;
    font-size: 1.5em;
    margin-bottom: 40px;
    height: 50px;
    font-style: italic;
    display: flex;
    justify-content: center;
    align-items: center;
}
.statBox {
    height: 100px;

    .statIcon {
        position: absolute;
        top: 20px;
        left: 20px;

        .v-icon {
            font-size: 4em;
        }
    }

    .statValue {
        position: absolute;
        top: 0;
        left: 100px;
        right: 15px;
        bottom: 0;

        .details {
            color: #aaa;
            font-size: 0.9em;
        }
    }
}

</style>
