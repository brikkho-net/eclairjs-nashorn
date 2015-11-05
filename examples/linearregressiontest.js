/*
 * Copyright 2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * We need to load SparkContext.js and SparkConf.js in order to create SparkContext
 * The SparkContext will load the rest of sparkJS files. So these are the oly two 
 * the user has to explicitly load. 
 */
//load("javascript/nashorn/SparkContext.js");
//load("javascript/nashorn/SparkConf.js");
var logger = org.apache.log4j.Logger.getLogger("linearregressiontest");

var sparkConf = new SparkConf()
  .setAppName("Linear Regression Test")
  .setMaster("local[*]");
  //.setMaster("spark://MacBook-Pro.local:7077");

var sc = new SparkContext(sparkConf);
//sc.addJar("/Users/billreed/cfa_dev/eclair-nashorn/target/eclair-nashorn-0.1.jar");
//sc.addJar("target/eclair-nashorn-0.1.jar");
/* 
 * All the sparkJS required JavaScrit and jar files are 
 * added when the SparkContext is created in SparkContex.js
 * 
sc.addJar("/Users/billreed/cfa_workspace/nashhorn/cfa.jar");


sc.addFile("javascript/nashorn/RDD.js");
sc.addFile("javascript/nashorn/SparkContext.js");
sc.addFile("javascript/nashorn/SparkConf.js");
sc.addFile("javascript/nashorn/LinearRegressionWithSGD.js");
sc.addFile("javascript/nashorn/LabeledPoint.js");
sc.addFile("javascript/nashorn/Utils.js");
//sc.addFile("javascript/nashorn/SparkFiles.js");
*/

/*
 * All the sparkJS JavaScript files are loaded into the Nashorn engine
 * when the engine is created in NashornEngineSingleton.java
load(org.apache.spark.SparkFiles.get("RDD.js"));
load(org.apache.spark.SparkFiles.get("Utils.js"));
load(org.apache.spark.SparkFiles.get("LinearRegressionWithSGD.js"));
load(org.apache.spark.SparkFiles.get("LabeledPoint.js"));
//load(org.apache.spark.SparkFiles.get("SparkFiles.js"));*/

var data = sc.textFile("examples/data/lpsa.data").cache();
var scopeVars = {};
var parsedData = data.map( function(s) { 
	//load(org.apache.spark.SparkFiles.get("LabeledPoint.js"));
	var logger = org.apache.log4j.Logger.getLogger("linearregressiontest:map Lambda");
	logger.info("map s = " + s);
	var parts = s.split(",");
	var features = parts[1].split(" "); 
	logger.info("creating labled point");
	return new LabeledPoint(parts[0], features);
 });
logger.info("after map");
var y = parsedData.count()
logger.info("Total count: " + y);
var t = parsedData.take(5);
//print(t.getClass().getName());
//for (var i = 0; i < t.size(); i++) {
//    var value = t.get(i);
//    print("value: " + value.getClass().getName());
//}
print("take 5 = " + JSON.stringify(parsedData.take(5)));
var numIterations = 3;
var linearRegressionModel = linearRegressionModelBC = LinearRegressionWithSGD.train(parsedData, numIterations);
logger.info("after LinearRegressionWithSGD" );

var delta = 17;
var valuesAndPreds = parsedData.mapToPair(function(lp, linearRegressionModel, delta) { // FIXME
					var logger = org.apache.log4j.Logger.getLogger("linearregressiontest:mapPair LAMBDA");
					logger.info("before getLabel");
					var label = lp.getLabel();
					
					logger.info("mapToPair label = " + label);
					logger.info("mapToPair delta = " + delta);
		    	    var prediction = linearRegressionModel.predict(lp.getFeatures());
		    	    logger.info("=====perdiction  = " + prediction );
		    	    return [prediction, label];

		        }); // end MapToPair
logger.info("after mapPair");
var c = valuesAndPreds.count();
logger.info("Total count: " + c);




