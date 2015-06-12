# build-script
build-script

可独立于项目

把build-script放于与项目的同一级

目前 集成了 less mincss minjs 和 browser-sync等功能

需要编译的项目目录结构：

		project
			|- css.src
			|- css
			|- js.src
			|- js
			|- html.src
				|- module
					|- header.module.html
			|- index.html


**inculde**

*include* 依赖于 *gulp-file-include*

*html.src/index.html*

		<!DOCTYPE html>
		<html lang="en">
		<head>
	    <meta charset="UTF-8">
	    <title>Document</title>
		</head>
		<body>
		    @@include('./module/header.module.html',{
		        "name" : "gulp"
		    })
		    <h1>
		        hello gulp!
		        <input type="text">
		    </h1>
		</body>
		</html>

*html.src/module/header.module.html*

		<h1>
	    这是HEADER
		</h1>
		<h2>
		    NAME:@@name
		</h2>