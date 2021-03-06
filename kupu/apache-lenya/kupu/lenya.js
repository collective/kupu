/**
 * This file contains all Lenya specific functions needed to
 * initialize and register tools.
 * @version $Id$
 */
function KupuLenyaDist(){
    this.isInit = false;
       
    this.exitKupuButtonHandler = function() {
        window.location.href = kupu.config.exit_destination        
    }
    
    this.init = function() {
        if(this.isInit) return;
        kupu.registerTool('savebutton', new KupuButton('kupu-exit-button', this.exitKupuButtonHandler));
        this.isInit = true;
    }
 }