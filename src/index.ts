// Entry point for Leaflet.DistortableImage
// This file imports all source files in the correct order to maintain compatibility

// Utility files
import './util/Utils.js';
import './util/DomUtil.js';
import './util/IconUtil.js';
import './util/ImageUtil.js';
import './util/MatrixUtil.js';
import './util/TrigUtil.js';

// Core overlay classes
import './DistortableImageOverlay.js';
import './DistortableCollection.js';

// Edit functionality
import './edit/getEXIFdata.js';

// Edit handles
import './edit/handles/EditHandle.js';
import './edit/handles/DistortHandle.js';
import './edit/handles/DragHandle.js';
import './edit/handles/FreeRotateHandle.js';
import './edit/handles/LockHandle.js';
import './edit/handles/RotateHandle.js';
import './edit/handles/ScaleHandle.js';

// Icon sets
import './iconsets/IconSet.js';
import './iconsets/KeymapperIconSet.js';
import './iconsets/ToolbarIconSet.js';

// Edit actions
import './edit/actions/EditAction.js';
import './edit/actions/BorderAction.js';
import './edit/actions/DeleteAction.js';
import './edit/actions/DistortAction.js';
import './edit/actions/DragAction.js';
import './edit/actions/ExportAction.js';
import './edit/actions/FreeRotateAction.js';
import './edit/actions/GeolocateAction.js';
import './edit/actions/LockAction.js';
import './edit/actions/OpacitiesAction.js';
import './edit/actions/OpacityAction.js';
import './edit/actions/RestoreAction.js';
import './edit/actions/RotateAction.js';
import './edit/actions/ScaleAction.js';
import './edit/actions/StackAction.js';
import './edit/actions/UnlockAction.js';

// Toolbars
import './edit/toolbars/DistortableImage.PopupBar.js';
import './edit/toolbars/DistortableImage.ControlBar.js';

// Edit modules
import './edit/DistortableImage.Edit.js';
import './edit/DistortableCollection.Edit.js';

// Components
import './components/DistortableImage.Keymapper.js';

// Map mixins
import './mapmixins/DoubleClickZoom.js';
import './mapmixins/BoxCollector.js';
import './mapmixins/DoubleClickLabels.js';
import './mapmixins/MapMixins.js';
