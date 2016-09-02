import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Dropzone from 'react-dropzone';
import assign from 'lodash/assign';
import mapValues from 'lodash/mapValues';
import pick from 'lodash/pick';
import uniqueId from 'lodash/uniqueId';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { Toolbar, ToolbarGroup} from 'material-ui/Toolbar';
import Popover from 'material-ui/Popover';
import Slider from 'material-ui/Slider';
import IconFlip from 'material-ui/svg-icons/image/flip';
import IconBrightness from 'material-ui/svg-icons/image/brightness-5';
import IconControlPoint from 'material-ui/svg-icons/image/control-point';
import Menu from 'material-ui/Menu';
import CircularProgress from 'material-ui/CircularProgress';
import { List, ListItem } from 'material-ui/List';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import Checkbox from 'material-ui/Checkbox';
import { WorkerRequest, WorkerResult, Edit } from './worker';
import * as cx from 'classnames';
import { Landmark, getStepsForAnalysis } from '../../analyses/helpers';
import downs from '../../analyses/downs';
import { descriptions } from './strings';
import AnalysisStepper from '../AnalysisStepper';
import CephaloCanvas from '../CephaloCanvas';


const ImageWorker = require('worker!./worker');
const classes = require('./style.scss');
const DropzonePlaceholder = require('./assets/placeholder.svg').default;

function isStepDone(s: Landmark, i: number): boolean {
  return i < 5;
}

function isCurrentStep(s: Landmark, i: number): boolean {
  return i === 5;
}

function getDescriptionForStep(s: Landmark): string | null {
  return descriptions[s.symbol] || s.description || null;
}

function getTitleForStep(s: Landmark): string {
  if (s.type === 'point') {
    return `Set point ${s.symbol} ${ s.name ? `(${s.name})` : '' }`;
  } else if (s.type === 'line') {
    return `Draw line ${s.symbol} ${ s.name ? `(${s.name})` : '' }`;
  } else if (s.type === 'angle') {
    return `Calculate angle ${s.symbol} ${ s.name ? `(${s.name})` : '' }`;
  }
  throw new TypeError(`Cannot handle this type of landmarks (${s.type})`);
}

interface CephaloEditorProps {
  className: string,
}

interface CephaloEditorState {
  url?: string,
  canvas: HTMLCanvasElement | null,
  anchorEl: Element | null,
  isLoading: true,
  open: boolean,
  isEditing: boolean,
  containerHeight: number,
  containerWidth: number,
  brightness: number,
  invert: boolean,
  flipX: boolean; flipY: boolean;
  isAnalysisActive: boolean,
  analysisSteps: Landmark[];
  isAnalysisComplete: boolean;
}

export interface Edit {
  method: string,
  args: Array<any>,
  isDestructive?: boolean,
}

export default class CephaloEditor extends React.Component<CephaloEditorProps, CephaloEditorState> {
  private listener: EventListener;
  private worker: ImageWorker;
  refs: { canvas: Element, canvasContainer: Element };
  state = {
    open: false, anchorEl: null,
    canvas: null,
    isEditing: false,
    isLoading: false,
    brightness: 0, invert: false,
    flipX: false, flipY: false,
    isAnalysisActive: true,
    isAnalysisComplete: false,
    analysisSteps: getStepsForAnalysis(downs),
    containerHeight: 0,
    containerWidth: 0,
    url: undefined,
  };

  handleDrop = (files: File[]) => {
    const file: File = files[0];
    
    this.setState(assign({ }, this.state, { isLoading: true }) as CephaloEditorState, () => {
      const canvasContainerEl = ReactDOM.findDOMNode(this.refs.canvasContainer);
      const { height, width }: any = 
        mapValues(
          pick(window.getComputedStyle(canvasContainerEl), 'height', 'width'),
          dim => Number(dim.replace('px', ''))
        );
      
      this.setState(assign({ }, this.state, { containerHeight: height, containerWidth: width }), () => {
        const requestId = uniqueId('action_');

        this.listener = this.worker.addEventListener('message', ({ data }: { data: WorkerResult }) => {
          if (data.id === requestId) {
            this.setState(assign({}, this.state, { url: data.url }));
            this.worker.removeEventListener('message', this.listener);
          }
        });

        this.worker.postMessage({
          id: requestId,
          file,
          edits: [{
            method: 'scaleToFit',
            args: [height, width],
          }]
        } as WorkerRequest);
      });
    });
  }

  handleTouchTap = (event: React.MouseEvent) => {
    event.preventDefault();
    this.setState(assign({ }, this.state, { open: true, anchorEl: event.currentTarget }) as CephaloEditorState);
  };

  handleRequestClose = () => {
    this.setState(assign({ }, this.state, { open: false, anchorEl: null }) as CephaloEditorState);
  };

  handleFlipX = () => {
    this.setState(assign({}, this.state, { flipX: !this.state.flipX }));
  }

  handleFlipY = () => {
    this.setState(assign({}, this.state, { flipY: !this.state.flipY }));
  }

  setBrightness = (event: React.MouseEvent, value: number) => {
    this.setState(assign({}, this.state, { brightness: value }));
  }

  setInvert = (event: React.MouseEvent, isChecked: boolean) => {
    this.setState(assign({}, this.state, { invert: isChecked }));
  }

  addPoint() {

  }

  componentDidMount() {
    this.worker = new ImageWorker;
  }

  componentWillUnmount() {
    this.worker && this.worker.removeEventListener('message', this.listener);
  }

  render() {
    const hasImage = !!this.state.url;
    const isLoading = this.state.isLoading;
    const cannotEdit = !hasImage || this.state.isEditing;
    const isAnalysisActive = hasImage;
    const anaylsisSteps = this.state.analysisSteps;
    const isAnalysisComplete = this.state.isAnalysisComplete;
    return (
      <div className={cx(classes.root, 'row', this.props.className)}>
        <div ref="canvasContainer" className={cx(classes.canvas_container, 'col-xs-12', 'col-sm-8')}>
          {hasImage ? (
            <CephaloCanvas
              className={classes.canvas}
              src={this.state.url}
              brightness={this.state.brightness}
              inverted={this.state.invert}
              flipX={this.state.flipX}
              flipY={this.state.flipY}
              height={this.state.containerHeight}
              width={this.state.containerWidth}
            />
          ) : isLoading ? (
            <CircularProgress color="white" size={2} />
          ) : (
            <Dropzone
              className={classes.dropzone}
              activeClassName={classes.dropzone__active}
              rejectClassName={classes.dropzone__reject}
              onDrop={this.handleDrop} multiple={false}
              accept="image/*" disablePreview
            >
              <div className={classes.dropzone_placeholder}>
                <DropzonePlaceholder className={classes.dropzone_placeholder_image} />
                Drop a cephalometric radiograph here or click to pick one
              </div>
            </Dropzone>
          )}
        </div>
        <div className={cx(classes.sidebar, 'col-xs-12', 'col-sm-4')}>
          <Toolbar>
            <ToolbarGroup firstChild>
              <FlatButton onClick={this.addPoint} disabled={cannotEdit} label="Add point" icon={<IconControlPoint />} />
              <FlatButton onClick={this.handleFlipX} disabled={cannotEdit} label="Flip" icon={<IconFlip />} />
              <FlatButton
                disabled={cannotEdit}
                label="Corrections" icon={<IconBrightness />}
                onClick={this.handleTouchTap}
              />
              <Popover
                open={this.state.open}
                anchorEl={this.state.anchorEl}
                anchorOrigin={{ horizontal: 'left', vertical: 'top'}}
                targetOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                onRequestClose={this.handleRequestClose}
              >
                <Slider
                  style={{ width: 200, margin: 15 }}
                  description="Brightness"
                  min={0} max={255}
                  defaultValue={this.state.brightness}
                  onChange={this.setBrightness}
                />
                <Divider />
                <Checkbox label="Invert" checked={this.state.invert} onCheck={this.setInvert} />
              </Popover>
            </ToolbarGroup>
          </Toolbar>
          { isAnalysisActive ? (
              <AnalysisStepper
                className={classes.list_steps}
                steps={anaylsisSteps}
                showResults={() => alert('results!')}
                currentStep={6}
                isAnalysisComplete={isAnalysisComplete}
                isStepDone={isStepDone}
                getDescriptionForStep={getDescriptionForStep}
                getTitleForStep={getTitleForStep}
                editLandmark={() => null}
                removeLandmark={() => null}
              />
            ) : (
              null
            )
          }
          <RaisedButton label="Continue" disabled={!isAnalysisComplete} primary />
        </div>
      </div>
    );
  }
}