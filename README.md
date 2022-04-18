# KURO

Human-machine collaborative land use classification system based on interactive visual guidance for the city of ShenZhen, China.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.


### `yarn test`

Launches the test runner in the interactive watch mode.


### `yarn build`

Builds the app for production to the `build` folder.

## Usage

- Add regions to train set.
- Train model with your train set and params.
- Adjust the train set and the feature's classify weight according to the analysis of classification and attribution results.
- Repeat the above steps until getting the satisfactory result.

## File Tree

```
.
├───public           // Static resources folder
│   ├───data             // Static data folder
│   └───image            // Static Image folder
├───src              // Source code folder
│   ├───assets           // Asset resources folder
│   │   ├───font                // Font folder
│   │   └───icon                // Icon folder
│   ├───components       // Folder for app components
│   │   ├───charts              // D3 chart components
│   │   ├───maps                // Map componnets
│   │   ├───xxx.ts              // Component file
│   │   ├───xxx.module.css      // Style sheet for component by post-css
│   │   └───index.ts            // Component module export file
│   ├───lib              // Folder for custom hooks and universal functions.
│   │   ├───useData             // Hook for load data
│   │   ├───useAttribute.ts     // Hook for feature attribution
│   │   ├───useRegionData.ts    // Hook for get region detail data
│   │   ├───useTrainModel.ts    // Hook for trainning models
│   │   └───util.ts             // Util functions
│   ├───App.tsx          // The overall framework
│   ├───App.less         // Style sheet for framework
│   ├───index.tsx        // Entry file of the project
│   ├───index.css        // Global style sheet
│   └───AppReducer.tsx   // Global variables by reducer and context
├───craco.config.js  // Config file for craco 
├───tsconfig.json    // Config file for typescript
└───package.json     // Config file for project
```



