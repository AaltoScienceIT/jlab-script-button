import {
  IDisposable, DisposableDelegate
} from '@phosphor/disposable';

import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  ClientSession, ToolbarButton
} from '@jupyterlab/apputils';

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  NotebookPanel, INotebookModel
} from '@jupyterlab/notebook';


/**
 * The plugin registration information.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  activate,
  id: 'scriptButton',
  autoStart: true
};

/**
 * A notebook widget extension that adds a button to the toolbar.
 */
export class ButtonExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {

  app: JupyterFrontEnd
  constructor(application: JupyterFrontEnd) {
    this.app = application
  }

  createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    let code = '![ -z $BUTTON_EXTENSION_CODE ] && /usr/local/bin/jlab_script_button.sh ' + context.localPath + 
                ' || eval $BUTTON_EXTENSION_CODE ' + context.localPath;
    let callback = async () => {
      let session = new ClientSession({
        manager: this.app.serviceManager.sessions,
        name: 'tmp_kernel_for_executing_button_code',
        kernelPreference: {
          name: 'python3'
        }
      });
      await session.initialize().catch(reason => {
        console.error(
          'Failed to initialize the session for codeButton.\n${reason}'
        );
      });
      await session.kernel.requestExecute({ code });
      await session.kernel.ready;
      session.shutdown()
    };
    let button = new ToolbarButton({
      className: 'scriptButton',
      iconClassName: 'fa fa-play-circle',
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
