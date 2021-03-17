class JoystickController {
	// stickID: ID of HTML element (representing joystick) that will be dragged
	// maxDistance: maximum amount joystick can move in any direction
	// deadzone: joystick must move at least this amount from origin to register value change
	constructor( stickID, maxDistance, deadzone, orientation) {
		this.orientation = orientation || 'both'
		this.id = stickID;
		// DOM element of the stick
		this.stick = document.getElementById(stickID);
		this.maxDistance = maxDistance;
		this.deadzone = deadzone;

		// location from which drag begins, used to calculate offsets
		this.dragStart = null;

		// track touch identifier in case multiple joysticks present
		this.pointerId = -1;
		
		this.value = { x: 0, y: 0 }; 

		this._handleDown = this.handleDown.bind(this);
		this._handleMove = this.handleMove.bind(this);
		this._handleUp = this.handleUp.bind(this);
		// add event listener
		this.stick.addEventListener('pointerdown', this._handleDown);
	}

	handleDown(event) {
		event.preventDefault();
		this.pointerId = event.pointerId;
		document.addEventListener('pointermove', this._handleMove, {passive: false});
		document.addEventListener('pointerup', this._handleUp);

		// all drag movements are instantaneous
		this.stick.style.transition = '0s';

		event.target.id = this.thumbId;
		this.dragStart = { x: event.clientX, y: event.clientY };
	}
		
	handleMove(event) {
		if (this.pointerId !== event.pointerId) {
			return;
		}
    event.preventDefault();
		
		const maxDistance = this.maxDistance;
		const deadzone = this.deadzone;

		const xDiff = event.clientX - this.dragStart.x;
		const yDiff = event.clientY - this.dragStart.y;
		const angle = Math.atan2(yDiff, xDiff);
		const distance = Math.min(maxDistance, Math.hypot(xDiff, yDiff));
		const vertical = this.orientation === 'vertical' || this.orientation === 'both';
		const horizontal = this.orientation === 'horizontal' || this.orientation === 'both';
		const xPosition = horizontal ? distance * Math.cos(angle) : 0;
		const yPosition = vertical ? distance * Math.sin(angle) : 0;

		// move stick image to new position
		this.stick.style.transform = `translate3d(${xPosition}px, ${yPosition}px, 0px)`;

		// deadzone adjustment
		const distance2 = (distance < deadzone) ? 0 : maxDistance / (maxDistance - deadzone) * (distance - deadzone);
		const xPosition2 = distance2 * Math.cos(angle);
		const yPosition2 = distance2 * Math.sin(angle);
		const xPercent = parseFloat((xPosition2 / maxDistance).toFixed(4));
		const yPercent = parseFloat((yPosition2 / maxDistance).toFixed(4));
		    
		this.value = { 
			x: horizontal ? xPercent : 0,
			y: vertical ? yPercent : 0 };
	}

	handleUp(event) {
		if (this.pointerId !== event.pointerId) {
			return;
		}
		// transition the joystick position back to center
		this.stick.style.transition = '.2s';
		this.stick.style.transform = `translate3d(0px, 0px, 0px)`;

		// reset everything
		this.value = { x: 0, y: 0 };
		document.removeEventListener('pointermove', this._handleMove, {passive: false});
		document.removeEventListener('pointerup', this._handleUp);
	}
}