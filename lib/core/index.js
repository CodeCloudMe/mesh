/*

bootstrap:

1. copy platform/bootstrap/ files over to project directory in src/
2. add additional common libraries to all copied platform link.json - dump in src/[platform]/link.json

build:

1. scan plugins in link.json - prepend platform/ if it doesn't exist
2. with plugins, scan src directory for plugins to include
3. scan built-in plugins - if used in #2, skip
4. copy found plugins into release/linked_plugins/[platform]
5. write code to scan /linked_plugins/* /*
6. build code into universal code (node.js)

wrap:

1. wrap the app using the specific builder: chrome, sardines, etc.


*/