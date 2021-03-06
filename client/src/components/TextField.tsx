import React from 'react';
import { ErrorTooltip } from '~components/tooltips';
import sharedStyles from '../styles/shared.scss';

const TextField = React.forwardRef(({ error, className, ...props }: any, ref: any): JSX.Element => {
	let classes = className ? className : '';
	if (error) {
		classes += ' ' + sharedStyles.errorField;
	}

	return (
		<ErrorTooltip title={error} arrow disableHoverListener={!error} disableFocusListener={!error}>
			<input {...props} className={classes} ref={ref} />
		</ErrorTooltip>
	);
});
TextField.displayName = 'TextField';

TextField.defaultProps = {
	type: 'text',
	error: ''
};

export default TextField;
