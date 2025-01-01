# pegboard-board-hook

This project contains JSCAD code in `index.js` to generate snowboard and skateboard hooks for mounting via [Sy's Peglock - Parametric Pegboard Attachment](https://www.printables.com/model/604771-sys-peglock-parametric-pegboard-attachment) by [@DonovanBaard_1316584](https://www.printables.com/@DonovanBaard_1316584).

One self-imposed requirement is that I reuse existing the steel pegboard hooks that I already bought, and insert them into the 3D print. I own several [Lowe's Project Source Steel Pegboard Hooks (8-in W x 1.38-in H)](https://www.lowes.com/pd/Blue-Hawk-1-Piece-Steel-Pegboard-Hook-Actual-8-in-x-1-38-in/50220689) that are now integrated into the design by using a digital twin and subtracting it from the hook base.

## Usage

To output pegboard-board-hook.stl, run the following commands:
```
npm install
npm run build
```

For development, you can monitor for changes and auto-build with this command:
```
npx nodemon
```

There are different 'flavors' of JSCAD that you can use based on your needs
- web: online (no install) simply go to [https://openjscad.xyz/](https://openjscad.xyz/)
- web: self hosted, cli, desktop app: see [https://github.com/jscad/OpenJSCAD.org](https://github.com/jscad/OpenJSCAD.org)
- node.js: custom mix and match of packages
  * all the packages are available [on NPM](https://www.npmjs.com/search?q=%40jscad) under the '@jscad' name

## License

[MIT License](./LICENSE)
