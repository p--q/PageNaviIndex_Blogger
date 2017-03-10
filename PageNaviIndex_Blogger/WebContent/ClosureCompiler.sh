FN=PageNaviIndex_Blogger
rm ${FN}
java -jar ~/closure-compiler/compiler.jar --js ${FN}.js --js_output_file ${FN}.min.js
