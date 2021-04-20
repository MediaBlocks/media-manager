/**
 * External dependencies
 */
import { debounce } from 'lodash';

/**
 * WordPress dependencies
 */
import { Popover, Button, RangeControl } from '@wordpress/components';
import { useAnchorRef } from '@wordpress/rich-text';
import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { convertSecondsToTimeCode, convertTimeCodeToSeconds } from '../../lib/time-utils';
import { mediaLinkFormatButtonSettings } from './';
import { STORE_ID, STATE_PAUSED, STATE_PLAYING } from '../../store/constants';
import { ControlBackFiveIcon, ControlForwardFiveIcon } from '../icons';

const playIcon = 'controls-play';
const pauseIcon = 'controls-pause';

const debouncedOnChange = debounce( function ( time, onChange ) {
	onChange( time );
}, 250 );

export function MediaPlayerControl( { sourceId, time, onChange } ) {
	const [ rangeTime, setRangeTime ] = useState( time );
	useEffect( () => setRangeTime( time ), [ time ] );

	const { mediaPlayingState, mediaDuration } = useSelect(
		( select ) => ( {
			mediaPlayingState: select( STORE_ID ).getMediaPlayerState(
				sourceId
			),
			mediaDuration: select( STORE_ID ).getMediaSourceDuration( sourceId ),
		} ),
		[]
	);

	const { toggleMediaSource, setMediaSourceCurrentTime } = useDispatch(
		STORE_ID
	);

	const isPaused = mediaPlayingState === STATE_PAUSED;

	function toggleInTime() {
		if ( mediaPlayingState !== STATE_PLAYING ) {
			setMediaSourceCurrentTime( sourceId, time );
		}
		toggleMediaSource( sourceId );
	}

	function onChangeTimeHandler( time ) {
		setRangeTime( time );
		debouncedOnChange( time, onChange );
	}


	const currentTimeFormatted = convertSecondsToTimeCode( rangeTime );

	return (
		<div className="media-player-control">
			<Button
				icon={ ControlBackFiveIcon }
				onClick={ () => onChange( Math.max( 0, time - 5 ) ) }
				label={ __( 'Jump back', 'media-center' ) }
			/>

			<Button
				icon={ isPaused ? playIcon : pauseIcon }
				disabled={ false }
				onClick={ () => toggleInTime() }
				label={
					isPaused
						? __( 'Play', 'media-center' )
						: __( 'Pause', 'media-center' )
				}
			/>

			<Button
				icon={ ControlForwardFiveIcon }
				onClick={ () => onChange( Math.min( mediaDuration, time + 5 ) ) }
				label={ __( 'Skip forward', 'media-center' ) }
			/>

			<div className="media-player-control__display">
				{ currentTimeFormatted }
			</div>

			<RangeControl
				disabled={ typeof mediaDuration === 'undefined' }
				value={ rangeTime }
				min={ 0 }
				max={ mediaDuration }
				onChange={ onChangeTimeHandler }
				withInputField={ false }
				showTooltip={ false }
			/>
		</div>
	);
}

export default function MediaLinkPopover( {
	value,
	isActive,
	contentRef,
	currentTime,
	sourceId,
	onTimeChange,
} ) {
	const anchorRef = useAnchorRef( {
		ref: contentRef,
		value,
		settings: mediaLinkFormatButtonSettings,
	} );

	if ( ! isActive ) {
		return null;
	}

	return (
		<Popover
			anchorRef={ anchorRef }
			position="bottom center"
			focusOnMount={ false }
		>
			<div className="media-link-popover">
				<MediaPlayerControl
					sourceId={ sourceId }
					time={ currentTime }
					onChange={ onTimeChange }
				/>
			</div>
		</Popover>
	);
}
