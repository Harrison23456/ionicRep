package com.mycompany.plugins.example;

import android.content.Context;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AndroidIdPlugin")
public class AndroidIdPluginPlugin extends Plugin {

    @PluginMethod
    public void getAndroidId(PluginCall call) {
        // Obtener el contexto y el Android ID
        Context context = getContext();
        String androidId = Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ANDROID_ID);

        // Retornar el Android ID como un JSObject
        JSObject ret = new JSObject();
        ret.put("androidId", androidId);

        // Resolver la llamada
        call.resolve(ret);
    }
}
