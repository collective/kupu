/*****************************************************************************
 *
 * Copyright (c) 2003-2004 Kupu Contributors. All rights reserved.
 *
 * This software is distributed under the terms of the Kupu
 * License. See LICENSE.txt for license text. For a list of Kupu
 * Contributors see CREDITS.txt.
 *
 *****************************************************************************/

// $Id$

function switchSourceEdit() {
    var editorframe = document.getElementById('kupu-editor');
    var sourcearea = document.getElementById('kupu-editor-textarea');
    var kupudoc = kupu.getInnerDocument();

    if (editorframe.style.display != 'none') {
        if (kupu.getBrowserName() == 'Mozilla') {
            kupudoc.designMode = 'Off';
        };
        kupu._initialized = false;
        var data = kupu.getInnerDocument().documentElement.getElementsByTagName('body')[0].innerHTML;
        sourcearea.value = data;
        editorframe.style.display = 'none';
        sourcearea.style.display = 'block';
      } else {
        var data = sourcearea.value;
        kupu.getInnerDocument().documentElement.getElementsByTagName('body')[0].innerHTML = data;
        sourcearea.style.display = 'none';
        editorframe.style.display = 'block';
        if (kupu.getBrowserName() == 'Mozilla') {
            kupudoc.designMode = 'On';
        };
        kupu._initialized = true;
    };
};
