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

package com.ibm.eclair;

import javax.script.Invocable;
import javax.script.ScriptEngine;

import org.apache.commons.lang.ArrayUtils;
import org.apache.spark.api.java.function.FlatMapFunction;
import jdk.nashorn.api.scripting.ScriptObjectMirror;

import java.util.HashMap;


public class JSFlatMapFunction implements FlatMapFunction {
	private String func = null;
	private Object args[] = null;
	private String functionName = null;

    public JSFlatMapFunction(String func,  Object[] o) {
    	this.functionName = Utils.getUniqeFunctionName();
        this.func = "var " + this.functionName +" = " + func;
        this.args = o;
    }

    @Override
    public Iterable call(Object o) throws Exception {


        ScriptEngine e =  NashornEngineSingleton.getEngine(); 
      //  e = Utils.addScopeVarsToEngine(this.scopeVar, e);

        e.eval(this.func);
        Invocable invocable = (Invocable) e;
        Object arg0 = Utils.javaToJs(o, e);
        Object params[] = {arg0};

        params = ArrayUtils.addAll(params, this.args);
        ScriptObjectMirror ret = (ScriptObjectMirror)invocable.invokeFunction(this.functionName, params);

        return (Iterable)ret.values();
    }
}
