import { connect } from 'react-redux'
import { fetchDatasets } from '../../actions/DatasetActions'
import Datasets  from '../Datasets'
import { findDeepDataset } from '../../util/ReduxHelpers';

const mapStateToProps = (state, ownProps) => { 
	const { loadedDatasets, loadsComplete } = state.user;
	//remove users if specified via a prop from parent
	var requiredDatasets = loadedDatasets;
	if(ownProps.include){
		requiredDatasets = loadedDatasets.filter(dset => ownProps.include.includes(dset._id));
	}
	if(ownProps.exclude){
		requiredDatasets = loadedDatasets.filter(dset => !ownProps.exclude.includes(dset._id))
	}
	return{
		datasets:requiredDatasets,
		//A flag propToCheck for withLoader HOC to make sure all datasets have been loaded
		datasetLoadsComplete:loadsComplete.datasets,
		loading:state.asyncProcesses.loading.datasets,
		loadingError:state.asyncProcesses.error.loading.datasets,
		...ownProps
	}
}
const mapDispatchToProps = dispatch => ({
	onLoad(){
		//alert('loading datasets')
		dispatch(fetchDatasets())
	}
})

//wrap all 4 sections in the same container for now.
const DatasetsContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(Datasets)

export default DatasetsContainer

