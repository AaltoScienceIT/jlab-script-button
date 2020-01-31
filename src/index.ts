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
  /*NotebookActions,*/ NotebookPanel, INotebookModel
} from '@jupyterlab/notebook';


/**
 * The plugin registration information.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  activate,
  id: 'aalto-gpu-button',
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
    let callback = async () => {
      let code = '!bash ./test.sh ' + context.localPath;
      let session = new ClientSession({
        manager: this.app.serviceManager.sessions,
        name: 'tmp_kernel_for_executing_' + context.localPath,
        kernelPreference: {
          name: 'python3'
        }
      });
      await session.initialize().catch(reason => {
        console.error(
          'Failed to initialize the session for GpuButton.\n${reason}'
        );
      });
      session.kernel.requestExecute({ code });
      await session.kernel.ready;
      session.shutdown()
      //NotebookActions.runAll(panel.content, context.session);
    };
    let button = new ToolbarButton({
      className: 'GPUbutton',
      iconClassName: 'fa fa-play-circle',
      onClick: callback,
      tooltip: 'Run With Gpu'
    });

    panel.toolbar.insertItem(0, 'runAll', button);
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
