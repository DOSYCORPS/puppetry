import React from "react";
import PropTypes from "prop-types";
import { message } from "antd";
import { ipcRenderer } from "electron";
import { confirmUnsavedChanges } from "service/smalltalk";
import { dateToTs } from "service/utils";
import { E_GIT_INIT,
  E_GIT_LOG, E_GIT_LOG_RESPONSE, E_GIT_COMMIT_RESPONSE } from "constant";


export class GitEnhancedMenu extends React.PureComponent {

  static propTypes = {
    action:  PropTypes.shape({
      setApp: PropTypes.func.isRequired,
      addAppTab: PropTypes.func.isRequired,
      saveGit: PropTypes.func.isRequired,
      saveSuite: PropTypes.func.isRequired,
      setSuite: PropTypes.func.isRequired
    }),
    isGitInitialized: PropTypes.any,
    gitConfigUsername: PropTypes.string.isRequired,
    gitConfigEmail: PropTypes.string.isRequired,
    gitDetachedHeadState: PropTypes.func.isRequired,
    git: PropTypes.object,
    project: PropTypes.object.isRequired,
    readyToRunTests: PropTypes.bool.isRequired,
    projectDirectory: PropTypes.string.isRequired,
    suiteModified: PropTypes.bool.isRequired
  }

  gitEnhancedMenuDidMount() {
    ipcRenderer.removeAllListeners( E_GIT_COMMIT_RESPONSE );
    ipcRenderer.on( E_GIT_COMMIT_RESPONSE, this.onFileGitCommitResponse );
  }

  onFileGitClone = () => {
    this.props.action.setApp({ gitCloneModal: true });
  }

  onFileGitCommitResponse = () => {
    this.props.action.saveGit({
      commitedAt: dateToTs()
    });
  }

  onFileGitCheckout = () => {
    this.props.action.setApp({ gitCheckoutModal: true });
    setTimeout( () => {
      ipcRenderer.send(
        E_GIT_LOG,
        this.props.projectDirectory
      );
      ipcRenderer.removeAllListeners( E_GIT_LOG_RESPONSE );
      ipcRenderer.on( E_GIT_LOG_RESPONSE, ( ev, logs ) => {
        this.props.action.setApp({ gitLogs: logs });
      });
    }, 10 );
  }

  onFileGitCommit = async () => {
    const { gitDetachedHeadState, isGitInitialized } = this.props;
    if ( !isGitInitialized || gitDetachedHeadState ) {
      return;
    }
    if ( this.props.suiteModified ) {
      await confirmUnsavedChanges({
        saveSuite: this.props.action.saveSuite,
        setSuite: this.props.action.setSuite
      });
    }
    this.props.action.setApp({ gitCommitModal: true });
  }

  onFileGitSync = async () => {
    if ( this.props.suiteModified ) {
      await confirmUnsavedChanges({
        saveSuite: this.props.action.saveSuite,
        setSuite: this.props.action.setSuite
      });
    }
    this.props.action.setApp({ gitSyncModal: true });
  }

  onFileGitInitialize = () => {
    const { projectDirectory, gitConfigUsername, gitConfigEmail } = this.props;

    if ( !projectDirectory ) {
      message.error( "Project directory is not specified" );
      return;
    }

    if ( !gitConfigUsername.trim() || !gitConfigEmail.trim() ) {
      message.error( "You need to provide GIT configuration first" );
      this.props.action.addAppTab( "projectGit" );
      return;
    }

    ipcRenderer.send( E_GIT_INIT, projectDirectory, gitConfigUsername, gitConfigEmail );
    this.props.action.saveGit({ initialized: true });
  }

}