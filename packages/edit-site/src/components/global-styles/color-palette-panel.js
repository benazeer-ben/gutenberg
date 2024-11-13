/**
 * WordPress dependencies
 */
import { useViewportMatch } from '@wordpress/compose';
import {
	__experimentalPaletteEdit as PaletteEdit,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { privateApis as blockEditorPrivateApis, useSettings } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';
import ColorVariations from './variations/variations-color';

const { useGlobalSetting } = unlock( blockEditorPrivateApis );
const mobilePopoverProps = { placement: 'bottom-start', offset: 8 };

export default function ColorPalettePanel( { name } ) {
	const [ themeColors, setThemeColors ] = useGlobalSetting(
		'color.palette.theme',
		name
	);
	const [ baseThemeColors ] = useGlobalSetting(
		'color.palette.theme',
		name,
		'base'
	);
	const [ defaultColors, setDefaultColors ] = useGlobalSetting(
		'color.palette.default',
		name
	);
	const [ baseDefaultColors ] = useGlobalSetting(
		'color.palette.default',
		name,
		'base'
	);
	const [ customColors, setCustomColors ] = useGlobalSetting(
		'color.palette.custom',
		name
	);

	const [ defaultPaletteEnabled ] = useGlobalSetting(
		'color.defaultPalette',
		name
	);
	const isMobileViewport = useViewportMatch( 'small', '<' );
	const popoverProps = isMobileViewport ? mobilePopoverProps : undefined;
	// Group settings, create a new group for each unique group name
	const colors = useSettings('color.palette.theme')[0] || [];

	// Extract unique group keys dynamically
	const groupKeys = colors.reduce((acc, color) => {
		if (color.group && !acc.includes(color.group)) {
			acc.push(color.group);
		}
		return acc;
	}, []);
	const groupSettings = groupKeys.reduce((acc, groupName) => {
		const [groupColors, setGroupColors] = useGlobalSetting(`color.palette.${groupName}`, name);
		const [baseGroupColors] = useGlobalSetting(`color.palette.${groupName}`, name, 'base');
		acc[groupName] = {
			colors: groupColors || [], // Ensure groupColors has a default value
			setColors: setGroupColors,
			baseColors: baseGroupColors || [], // Ensure baseGroupColors has a default value
		};
		return acc;
	}, {});

	return (
		<VStack
			className="edit-site-global-styles-color-palette-panel"
			spacing={ 8 }
		>
			{ !! themeColors && !! themeColors.length && (
				<PaletteEdit
					canReset={ themeColors !== baseThemeColors }
					canOnlyChangeValues
					colors={ themeColors }
					onChange={ setThemeColors }
					paletteLabel={ __( 'Theme' ) }
					paletteLabelHeadingLevel={ 3 }
					popoverProps={ popoverProps }
				/>
			) }
			{ !! defaultColors &&
				!! defaultColors.length &&
				!! defaultPaletteEnabled && (
					<PaletteEdit
						canReset={ defaultColors !== baseDefaultColors }
						canOnlyChangeValues
						colors={ defaultColors }
						onChange={ setDefaultColors }
						paletteLabel={ __( 'Default' ) }
						paletteLabelHeadingLevel={ 3 }
						popoverProps={ popoverProps }
					/>
				) }
			<PaletteEdit
				colors={ customColors }
				onChange={ setCustomColors }
				paletteLabel={ __( 'Custom' ) }
				paletteLabelHeadingLevel={ 3 }
				slugPrefix="custom-"
				popoverProps={ popoverProps }
			/>
			{Object.entries(groupSettings).map(([groupName, groupSetting]) => (
				<PaletteEdit
					key={groupName}
					canReset={groupSetting.colors !== groupSetting.baseColors}
					// canOnlyChangeValues
					colors={groupSetting.colors} // Display group colors
					onChange={(newColors) => {
						if (groupSetting.setColors) {
							groupSetting.setColors(newColors); // Update group colors
						}
					}}
					paletteLabel={groupName}
					paletteLabelHeadingLevel={3}
					popoverProps={popoverProps}
				/>
			))}
			<ColorVariations title={ __( 'Palettes' ) } />
		</VStack>
	);
}
