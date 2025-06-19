package com.sippysolution.universalliquor;

import android.os.Bundle;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Ensure status bar is visible and not hidden
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        
        // Allow status bar to be styled
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
    }
}
