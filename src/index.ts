import {
  IDisposable, DisposableDelegate
} from '@lumino/disposable';

import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  ToolbarButton //, SessionContext
} from '@jupyterlab/apputils';

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  NotebookPanel, INotebookModel
} from '@jupyterlab/notebook';

import { 
  jupyterIcon 
} from "@jupyterlab/ui-components";

/**
 * The plugin registration information.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  activate,
  id: 'jlab-script-button',
  autoStart: true
};


export class ButtonExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {

  app: JupyterFrontEnd
  constructor(application: JupyterFrontEnd) {
    this.app = application
  }

  createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    let code = '![ -z $BUTTON_EXTENSION_SCRIPT_PATH ] && /usr/local/bin/jlab_script_button.sh ' + context.localPath + 
                ' || eval $BUTTON_EXTENSION_SCRIPT_PATH ' + context.localPath;

    let callback = async () => {
      
//      let sessionContext = new SessionContext({
//        sessionManager: this.app.serviceManager.sessions,
//        specsManager: this.app.serviceManager.kernelspecs,
//        name: 'tmp_kernel_for_executing_button_code',
//        kernelPreference: {
//          name: 'python3'
//        }
//      });
//      await sessionContext.initialize();
//      let session = sessionContext.session;
      let session = context.sessionContext.session;
//      await session.initialize().catch(reason => {
//        console.error(
//          'Failed to initialize the session for script button.\n${reason}'
//        );
//      });

      await session.kernel.requestExecute({ code });
//      await session.kernel.ready;
//      session.shutdown()
    };
    let button = new ToolbarButton({
      className: 'jlab-script-button',
      icon: jupyterIcon,
      onClick: callback,
      tooltip: 'Do a thing'
    });

    panel.toolbar.insertItem(10, 'scriptB', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}

/**
 * Activate the extension.
 */
function activate(app: JupyterFrontEnd) {
  app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension(app));
};


/**
 * Export the plugin as default.
 */
export default plugin;
