import Vue from 'vue';
import Editor from './editor.vue';
import Loader from './loader.vue';
import Navbar from './navbar.vue';

console.log("coucou");
Vue.component(Editor.name, Editor);
Vue.component(Loader.name, Loader);
Vue.component(Navbar.name, Navbar);
console.log(Editor);

console.log("bye bye");
