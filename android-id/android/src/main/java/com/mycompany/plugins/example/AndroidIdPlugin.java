package com.mycompany.plugins.example;

import android.content.Context;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import android.util.Log;

@CapacitorPlugin(name = "AndroidId")
public class AndroidIdPlugin extends Plugin {

    @PluginMethod
    public void getAndroidId(PluginCall call) {
        // Obtener el contexto de la aplicación
        Context context = getContext();
        // Obtener el Android ID
        String androidId = Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ANDROID_ID);
        
        // Retornar el valor en un JSObject
        JSObject ret = new JSObject();
        ret.put("androidId", androidId);
        call.resolve(ret);
    }
}
