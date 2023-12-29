
# Abstract

CSS 파일내에 중복된 속성에 대해 상위에 선언된 속성만 남기고 동일 속성명에 대해서는 삭제를 수행.

# Example
```css
/* input.css */
h1 {
    margin: 0 auto;
    padding-left: 10px;
}
h1 { margin: 10 10 10 10;
}
h1 { color:red;
}

/* output.css */
h1 {
    margin: 0 auto;
    padding-left: 10px;
}
```

# Summary


```bash
# 패키지 설치
> npm i

# input.css, input2.css 파일 번들링 input.css, input2.css => bundle.css
> npm run bundle

# bundle.css 파일내의 중복 제거 bundle.css => output.css
> npm run build

# output.css 파일 압축 output.css => output.min.css
> npm run build:min
```



# postcss 를 이용하여 CSS의 중복을 제거

postcss : CSS 후처리를 수행하는 node 기반 플러그인. 

후처리? 

- CSS 중복제거
- CSS 압축
- 등등의 다양한 CSS 관련 후처리

웹팩은 번들링 기능을 수행.

postcss는 파일 단위로 기능을 수행.

일단 본 포스팅의 목적은 CSS 중복 제거가 목적이므로 postcss 를 이용해 중복제거 하는 부분 진행.

여러 플러그인 검토 결과 원하는 결과가 나오는 플러그인은 없는 것 같아 custom 메서드를 이용하기로 함.

```bash
# 프로젝트 초기화
> npm init -y

# 플러그인 설치
> npm i -D postcss postcss-cli

# node 의 버전은 18.15.0 으로 진행
> node -v
v18.15.0

> nvm list

  * 18.15.0 (Currently using 64-bit executable)
    14.17.4

```

<aside>
💡 14.17.4 버전에서는 postcss-cli 가 동작하지 않는다. 아래의 명령어로 버전 변경.
> nvm use 18.15.0

</aside>

[nvm 사용방법 참고](https://www.notion.so/Node-nvm-ff14a4cc77104cda9c68590d1f9dadae?pvs=21)

**package.json 파일 내용**

```jsx
{
  "name": "postcss2",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "postcss dist/input.css --output dist/output.css"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "postcss": "^8.4.32",
    "postcss-cli": "^11.0.0"
  }
}
```

dist 폴더에 input.css 파일의 내용에서 중복제거하여 output.css 로 떨구도록 설정하였다.

**dist/input.css 파일 내용**

```css
h1 {
    margin: 0 auto;
    padding-left: 10px;
}

h1 { margin: 10 10 10 10;
}
h1 { color:red;
}

.test{
	color:red;
}

.hello{
	background-color:blue;
}

.foo {
  width: 100px;
  height: 100px;
}

.foo{
  height: 100px;
  width: 100px;
}

.test{
	margin: 0 auto;
    padding-left: 10px;
}
```

input.css 파일내용 중 중복된 h1 선언의 경우 맨 위에것만 남기도록 처리할 것이다. (bold 로 처리된 부분만 남아야 함)

**postcss.config.js 파일 내용**

```jsx
const postcss = require('postcss');

module.exports = {
  plugins: [
    customMerge({})
  ],
};

// Custom postcss-clean plugin to keep only the last declaration of each rule
function customMerge(options) {
  return postcss.plugin('custom-clean', () => {
    return (root, result) => {
      const visitedRules = new Map();

      root.walkRules((rule) => {
        const selector = rule.selector;

        if (!visitedRules.has(selector)) {
          visitedRules.set(selector, rule);
        }
      });

      root.removeAll();

      visitedRules.forEach((rule) => {
        root.append(rule);
      });
    };
  });
}
```

**빌드 수행**

```bash
> npm run build

> postcss2@1.0.0 build
> postcss dist/bundle.css --output dist/output.css

custom-clean: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration
```

**dist/output.css 파일 결과**

```css
h1 {
    margin: 0 auto;
    padding-left: 10px;
}

.test{
	color:red;
}

.hello{
	background-color:blue;
}

.foo {
  width: 100px;
  height: 100px;
}
```

여기까지 하면 CSS 중복을 제거 하는 작업이 완료되었다.

# 웹팩을 이용한 CSS 번들링

[Webpack](https://www.yeummy-blog.com/post/d624ea50-6947-4f8d-9f0f-97f5989b9849)

여러개의 CSS 를 하나의 파일로 번들링 하는 작업은 postcss로는 처리할 수 없다.

웹팩을 이용하여 번들링 작업을 진행한다.

작업 순서

**1) 웹팩을 이용하여 여러개의 CSS를 하나의 파일로 번들링**

**2) 위에서 세팅한 postcss를 이용하여 번들된 파일의 중복을 제거**

1) 웹팩을 이용하여 여러개의 CSS를 하나의 파일로 번들링

```bash
# 웹팩 설치
> npm i -D webpack webpack-cli css-loader mini-css-extract-plugin
```

mini-css-extract-plugin : external 방식(css 파일을 별도로 만들어서 가져오는 형태)으로 작업

[CSS 파일 개별 추출](https://yamoo9.gitbook.io/webpack/webpack/webpack-plugins/extract-css-files#css-file-extract-plugin)

[css-loader, style-loader에 대한 작은 지식들](https://velog.io/@jay/css-loader-config)

**webpack.config.js 파일 생성**

```jsx
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode : 'production',
  entry: './entry.js', // 번들링의 시작점
  output: {
    filename: 'bundle.js', // JavaScript 번들 파일
    path: path.resolve(__dirname, 'dist'), // 출력 디렉토리
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'bundle.css', // CSS 번들 파일
    }),
  ],
};
```

<aside>
💡 entry.js 파일에서 import 된 파일들을 하나로 병합하여 dist 폴더에 bundle.css 파일로 떨구도록 설정

</aside>

**package.json 파일 내용**

```jsx
{
  "name": "postcss2",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "bundle": "webpack --config webpack.config.js",
    "build": "postcss dist/bundle.css --output dist/output.css"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "css-loader": "^6.8.1",
    "mini-css-extract-plugin": "^2.7.6",
    "postcss": "^8.4.32",
    "postcss-cli": "^11.0.0",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4"
  }
}
```

<aside>
💡 bundle 스크립트를 추가 : 웹팩으로 entry.js 에 있는 css 파일들을 하나로 묶어 dist 폴더에 bundle.css 로 떨군다.
build 스크립트 수정 : dist 폴더의 bundle.css 파일의 중복을 제거하여 output.css로 떨군다.

</aside>

**entry.js 파일 생성**

```jsx
import './input2.css';
import './input.css';
```

input.css

```css
h1 {
    margin: 0 auto;
    padding-left: 10px;
}

h1 { margin: 10 10 10 10;
}
h1 { color:red;
}

.test{
	color:red;
}

.hello{
	background-color:blue;
}

.foo {
  width: 100px;
  height: 100px;
}

.foo{
  height: 100px;
  width: 100px;
}

.test{
	margin: 0 auto;
    padding-left: 10px;
}
```

input2.css

```css
h1 {
    margin: 0 auto;
    padding-left: 10px;
}

h1 { margin: 10 10 10 10;
}
h1 { color:red;
}

.test{
	color:red;
}

.hello{
	background-color:blue;
}

.foo {
  width: 100px;
  height: 100px;
}

.foo{
  height: 100px;
  width: 100px;
}

.test{
	margin: 0 auto;
    padding-left: 10px;
}

h1 {
    margin: 0 auto;
    padding-left: 10px;
}

h1, h2 { margin: 10 10 10 10;
}
h1 { color:red;
}
h1, h2 { margin: 10 10 10 10;
	margin: 0 auto;
    padding-left: 10px;

}

.hwan77{
	color:red;
}
```

**빌드 수행**

```bash
> npm run bundle

> postcss2@1.0.0 bundle
> webpack --config webpack.config.js

asset bundle.css 966 bytes [compared for emit] (name: main)
asset bundle.js 0 bytes [compared for emit] [minimized] (name: main)
Entrypoint main 966 bytes = bundle.css 966 bytes bundle.js 0 bytes
orphan modules 4.28 KiB (javascript) 1.83 KiB (runtime) [orphan] 14 modules
cacheable modules 47 bytes (javascript) 964 bytes (css/mini-extract)
  ./entry.js 47 bytes [built] [code generated]
  css ./node_modules/css-loader/dist/cjs.js!./input2.css 494 bytes [built] [code generated]
  css ./node_modules/css-loader/dist/cjs.js!./input.css 470 bytes [built] [code generated]
webpack 5.89.0 compiled successfully in 292 ms
```

**bundle.css 결과 파일**

```css
h1 {
    margin: 0 auto;
    padding-left: 10px;
}

h1 { margin: 10 10 10 10;
}
h1 { color:red;
}

.test{
	color:red;
}

.hello{
	background-color:blue;
}

.foo {
  width: 100px;
  height: 100px;
}

.foo{
  height: 100px;
  width: 100px;
}

.test{
	margin: 0 auto;
    padding-left: 10px;
}

h1 {
    margin: 0 auto;
    padding-left: 10px;
}

h1, h2 { margin: 10 10 10 10;
}
h1 { color:red;
}
h1, h2 { margin: 10 10 10 10;
	margin: 0 auto;
    padding-left: 10px;

}

.hwan77{
	color:red;
}
h1 {
    margin: 0 auto;
    padding-left: 10px;
}

h1 { margin: 10 10 10 10;
}
h1 { color:red;
}

.test{
	color:red;
}

.hello{
	background-color:blue;
}

.foo {
  width: 100px;
  height: 100px;
}

.foo{
  height: 100px;
  width: 100px;
}

.test{
	margin: 0 auto;
    padding-left: 10px;
}
```

<aside>
💡 input2.css 파일과 input.css 파일을 선언된 순서대로 합쳐진 결과 파일이 생성됨.

</aside>

2) 위에서 세팅한 postcss를 이용하여 번들된 파일의 중복을 제거

postcss 중복 제거 수행해보자

```bash
> npm run build

> postcss2@1.0.0 build
> postcss dist/bundle.css --output dist/output.css

custom-clean: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration
```

**output.css 파일 내용**

```css
h1 {
    margin: 0 auto;
    padding-left: 10px;
}

.test{
	color:red;
}

.hello{
	background-color:blue;
}

.foo {
  width: 100px;
  height: 100px;
}

h1, h2 { margin: 10 10 10 10;
}

.hwan77{
	color:red;
}
```

# postcss-clean을 이용한 CSS 압축

**postcss-clean 설치**

```bash
> npm i -D postcss-clean
```

**package.json 파일 내용**

```jsx
{
  "name": "postcss2",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "bundle": "webpack --config webpack.config.js",
    "build": "postcss dist/bundle.css --output dist/output.css",
    "build:min": "postcss dist/output.css --use postcss-clean -o dist/output.min.css"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "css-loader": "^6.8.1",
    "mini-css-extract-plugin": "^2.7.6",
    "postcss": "^8.4.32",
    "postcss-clean": "^1.2.2",
    "postcss-cli": "^11.0.0",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4"
  }
}
```

<aside>
💡 build:min 스크립트를 추가했다. 다른설정은 불필요.

</aside>

**바로 빌드 수행**

```bash
> npm run build:min
```

**output.min.css 파일 결과 내용**
```css
h1{margin:0 auto;padding-left:10px}.test{color:red}.hello{background-color:#00f}.foo{width:100px;height:100px}h1,h2{margin:10 10 10 10}.hwan77{color:red}
/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIiUzQ2lucHV0JTIwY3NzJTIwMSUzRSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxHQUFHLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLFNBQVMsQ0FBQyxPQUFPLHFCQUFxQixDQUFDLEtBQUssV0FBVyxDQUFDLFlBQVksQ0FBQyxNQUFNLGtCQUFrQixDQUFDLFFBQVEsU0FBUyIsImZpbGUiOiJvdXRwdXQubWluLmNzcyIsInNvdXJjZXNDb250ZW50IjpbImgxe21hcmdpbjowIGF1dG87cGFkZGluZy1sZWZ0OjEwcHh9LnRlc3R7Y29sb3I6cmVkfS5oZWxsb3tiYWNrZ3JvdW5kLWNvbG9yOiMwMGZ9LmZvb3t3aWR0aDoxMDBweDtoZWlnaHQ6MTAwcHh9aDEsaDJ7bWFyZ2luOjEwIDEwIDEwIDEwfS5od2FuNzd7Y29sb3I6cmVkfSJdfQ== */
```
