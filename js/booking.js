(() => {
/* ---------------- Booking flow -> WhatsApp ---------------- */
const bookingForm = document.getElementById('bookingForm');
const bookingSteps = [...bookingForm.querySelectorAll('.booking-step')];
const bookingProgress = document.getElementById('bookingProgressTrack');
const bookingStepCount = document.getElementById('bookingStepCount');
const bookingStepName = document.getElementById('bookingStepName');
const bookingStepError = document.getElementById('bookingStepError');
const bookingNext = document.getElementById('bookingNext');
const bookingBack = document.getElementById('bookingBack');
const bookingServiceSelect = document.getElementById('fservice');
const bookingStepNames = ['Choose a service','Preferred date & time','Your details','Shoot location','Additional requirements','Review booking'];
const bookingDate = document.getElementById('fdate');
const localToday = new Date();
bookingDate.min = `${localToday.getFullYear()}-${String(localToday.getMonth()+1).padStart(2,'0')}-${String(localToday.getDate()).padStart(2,'0')}`;
let currentBookingStep = 1;

function syncBookingServiceChoice(){
  const selectedService = bookingServiceSelect.value;
  bookingForm.querySelectorAll('input[name="bookingServiceChoice"]').forEach(input => {
    input.checked = input.value === selectedService;
    input.closest('.booking-service-card').classList.toggle('selected', input.checked);
  });
}
bookingServiceSelect.addEventListener('change', syncBookingServiceChoice);
bookingForm.querySelectorAll('input[name="bookingServiceChoice"]').forEach(input => {
  input.addEventListener('change', () => {
    bookingServiceSelect.value = input.value;
    bookingServiceSelect.dispatchEvent(new Event('change', {bubbles:true}));
    clearBookingError();
  });
});
syncBookingServiceChoice();

function clearBookingError(){
  bookingStepError.hidden = true;
  bookingStepError.textContent = '';
}
function setBookingError(message){
  bookingStepError.textContent = message;
  bookingStepError.hidden = false;
}
function updateBookingProgress(){
  bookingStepCount.innerHTML = `${String(currentBookingStep).padStart(2,'0')} <span>/ 06</span>`;
  bookingStepName.textContent = bookingStepNames[currentBookingStep-1];
  [...bookingProgress.children].forEach((bar,index)=>bar.classList.toggle('complete',index<currentBookingStep));
  bookingBack.disabled = currentBookingStep === 1;
  bookingNext.type = currentBookingStep === 6 ? 'submit' : 'button';
  bookingNext.innerHTML = currentBookingStep === 6
    ? 'Send via WhatsApp <span aria-hidden="true">↗</span>'
    : 'Continue <span aria-hidden="true">→</span>';
  document.getElementById('bookingFooterNote').textContent = currentBookingStep === 6 ? 'No payment required' : 'No payment required';
}
function goToBookingStep(step){
  currentBookingStep = Math.min(6,Math.max(1,step));
  bookingSteps.forEach((panel,index)=>{
    const active = index+1 === currentBookingStep;
    panel.hidden = !active;
    panel.classList.toggle('active',active);
  });
  clearBookingError();
  updateBookingProgress();
  if(currentBookingStep === 6) renderBookingSummary();
  const heading = bookingSteps[currentBookingStep-1].querySelector('h3');
  if(heading){
    heading.tabIndex = -1;
    requestAnimationFrame(()=>heading.focus({preventScroll:true}));
  }
}
function validateBookingStep(){
  clearBookingError();
  const panel = bookingSteps[currentBookingStep-1];
  if(currentBookingStep === 1 && !bookingForm.querySelector('input[name="bookingServiceChoice"]:checked')){
    setBookingError('Choose a service to continue.');
    bookingForm.querySelector('input[name="bookingServiceChoice"]').focus();
    return false;
  }
  if(currentBookingStep === 4){
    const locationType = bookingForm.querySelector('input[name="bookingLocation"]:checked');
    if(!locationType){
      setBookingError('Choose where the shoot will take place.');
      bookingForm.querySelector('input[name="bookingLocation"]').focus();
      return false;
    }
    if(locationType.value === 'On location' && !document.getElementById('flocation').value.trim()){
      const address = document.getElementById('flocation');
      address.setCustomValidity('Please add the venue or address.');
      address.reportValidity();
      address.focus();
      return false;
    }
  }
  const invalid = [...panel.querySelectorAll('input:required,select:required,textarea:required')]
    .find(control => !control.checkValidity());
  if(invalid){
    invalid.reportValidity();
    invalid.focus();
    setBookingError('Please complete the required field to continue.');
    return false;
  }
  if(currentBookingStep === 3 && !document.getElementById('fname').value.trim()){
    document.getElementById('fname').setCustomValidity('Please enter your name.');
    document.getElementById('fname').reportValidity();
    document.getElementById('fname').focus();
    setBookingError('Please enter your name to continue.');
    return false;
  }
  if(currentBookingStep === 3){
    const phone = document.getElementById('fphone');
    const phoneValue = phone.value.trim();
    if(!/^[0-9+().\s-]{7,20}$/.test(phoneValue) || phoneValue.replace(/\D/g,'').length < 7){
      phone.setCustomValidity('Enter a valid phone number with at least 7 digits.');
      phone.reportValidity();
      phone.focus();
      setBookingError('Please enter a valid phone number to continue.');
      return false;
    }
  }
  return true;
}
bookingForm.addEventListener('input', e => {
  if(e.target.matches('input,textarea')) e.target.setCustomValidity('');
  if(e.target.closest('.booking-step-error')) clearBookingError();
});
bookingForm.addEventListener('change', e => {
  if(e.target.name === 'bookingLocation'){
    const atLocation = e.target.value === 'On location';
    const addressField = document.getElementById('bookingAddressField');
    const address = document.getElementById('flocation');
    addressField.hidden = !atLocation;
    address.required = atLocation;
    address.setCustomValidity('');
    document.getElementById('bookingLocationNote').textContent = atLocation
      ? 'Add a venue or area so we can plan travel and coverage.'
      : e.target.value === 'Foto Star Nepal Studio'
        ? 'Studio: Kupondole / Pulchowk Main Road, Lalitpur.'
        : 'We can confirm the location together after your inquiry.';
  }
  if(e.target.matches('input,select,textarea')) clearBookingError();
});
bookingNext.addEventListener('click', () => {
  if(currentBookingStep < 6 && validateBookingStep()) goToBookingStep(currentBookingStep+1);
});
bookingBack.addEventListener('click', () => goToBookingStep(currentBookingStep-1));

function createBookingRequest(){
  const locationType = bookingForm.querySelector('input[name="bookingLocation"]:checked')?.value || '';
  const address = document.getElementById('flocation').value.trim();
  const location = locationType === 'Foto Star Nepal Studio'
    ? 'Foto Star Nepal Studio — Kupondole / Pulchowk Main Road, Lalitpur'
    : locationType === 'On location'
      ? address
      : 'To be confirmed';
  return {
    service: bookingServiceSelect.value,
    preferredDate: bookingDate.value,
    preferredTime: document.getElementById('ftime').value,
    client: {
      name: document.getElementById('fname').value.trim(),
      phone: document.getElementById('fphone').value.trim(),
      email: document.getElementById('femail').value.trim()
    },
    location: {type:locationType, address:location},
    requirements: document.getElementById('fmsg').value.trim()
  };
}
function renderBookingSummary(){
  const request = createBookingRequest();
  const rows = [
    ['Service',request.service,1],
    ['Date',window.FotoStar.utils.formatBookingDate(request.preferredDate),2],
    ['Time',request.preferredTime,2],
    ['Name',request.client.name,3],
    ['Phone',request.client.phone,3],
    ...(request.client.email ? [['Email',request.client.email,3]] : []),
    ['Location',request.location.address,4],
    ['Notes',request.requirements || 'None provided',5]
  ];
  const summary = document.getElementById('bookingSummary');
  summary.replaceChildren();
  rows.forEach(([label,value,step])=>{
    const row = document.createElement('div');
    row.className = 'booking-summary-row';
    const rowLabel = document.createElement('span');
    rowLabel.className = 'booking-summary-label';
    rowLabel.textContent = label;
    const rowValue = document.createElement('span');
    rowValue.className = 'booking-summary-value';
    rowValue.textContent = value;
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'booking-summary-edit';
    edit.textContent = 'Edit';
    edit.setAttribute('aria-label',`Edit ${label.toLowerCase()}`);
    edit.dataset.editBookingStep = step;
    row.append(rowLabel,rowValue,edit);
    summary.appendChild(row);
  });
}
document.getElementById('bookingSummary').addEventListener('click',e=>{
  const edit = e.target.closest('[data-edit-booking-step]');
  if(edit) goToBookingStep(Number(edit.dataset.editBookingStep));
});
let lastBookingRequest = null;
function createBookingWhatsAppMessage(request){
  return `📸 New Photography Booking Inquiry — Foto Star Nepal
👤 Client: ${request.client.name}
📞 Phone: ${request.client.phone}
✉️ Email: ${request.client.email || 'Not provided'}
🎯 Service: ${request.service}
📅 Preferred date: ${window.FotoStar.utils.formatBookingDate(request.preferredDate)}
🕒 Preferred time: ${request.preferredTime}
📍 Location: ${request.location.address}
📝 Requirements: ${request.requirements || 'None provided'}`;
}
bookingForm.addEventListener('submit',e=>{
  e.preventDefault();
  if(currentBookingStep < 6){
    if(validateBookingStep()) goToBookingStep(currentBookingStep+1);
    return;
  }
  if(!validateBookingStep()) return;
  lastBookingRequest = createBookingRequest();
  const waUrl = window.FotoStar.utils.buildWaLink(createBookingWhatsAppMessage(lastBookingRequest));
  const waWindow = window.open(waUrl,'_blank','noopener');
  document.getElementById('bookingWhatsAppFallback').href = waUrl;
  document.getElementById('bookingWhatsAppFallback').hidden = Boolean(waWindow);
  document.getElementById('bookingFormContent').hidden = true;
  document.getElementById('bookingFormFooter').hidden = true;
  document.getElementById('bookingPrivacyNote').hidden = true;
  document.getElementById('bookingProgressTrack').parentElement.hidden = true;
  document.getElementById('bookingStepError').hidden = true;
  document.getElementById('bookingConfirmation').hidden = false;
});
document.getElementById('bookingRestart').addEventListener('click',()=>{
  bookingForm.reset();
  bookingServiceSelect.value = '';
  bookingServiceSelect.dispatchEvent(new Event('change',{bubbles:true}));
  document.getElementById('bookingAddressField').hidden = true;
  document.getElementById('flocation').required = false;
  document.getElementById('bookingLocationNote').textContent = 'Studio: Kupondole / Pulchowk Main Road, Lalitpur.';
  document.getElementById('bookingWhatsAppFallback').hidden = true;
  document.getElementById('bookingConfirmation').hidden = true;
  document.getElementById('bookingFormContent').hidden = false;
  document.getElementById('bookingFormFooter').hidden = false;
  document.getElementById('bookingPrivacyNote').hidden = false;
  document.getElementById('bookingProgressTrack').parentElement.hidden = false;
  lastBookingRequest = null;
  goToBookingStep(1);
});
goToBookingStep(1);

/* ---------------- Glass booking modal ---------------- */
const bookingModal = document.getElementById('bookingModal');
function openModal(){ bookingModal.classList.add('open'); bookingModal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
function closeModal(){ bookingModal.classList.remove('open'); bookingModal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
document.getElementById('navBookBtn').addEventListener('click', e => { e.preventDefault(); openModal(); });
document.getElementById('floatCta').addEventListener('click', e => { e.preventDefault(); openModal(); });
document.getElementById('mobileBookCta').addEventListener('click', e => { e.preventDefault(); openModal(); });
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalBg').addEventListener('click', closeModal);
window.addEventListener('keydown', e => { if(e.key==='Escape' && bookingModal.classList.contains('open')) closeModal(); });

document.getElementById('modalForm').addEventListener('submit', function(e){
  e.preventDefault();
  const name = document.getElementById('mfname').value;
  const phone = document.getElementById('mfphone').value;
  const service = document.getElementById('mfservice').value;
  const date = document.getElementById('mfdate').value;
  const location = document.getElementById('mflocation').value;
  const msg = document.getElementById('mfmsg').value;
  const waMsg = `📸 New Photography Booking Request — Foto Star Nepal
👤 Client Name: ${name}
📞 Contact Number: ${phone}
🎯 Service Needed: ${service}
📅 Event Date: ${date || 'Not specified'}
📍 Location/Venue: ${location || 'Not specified'}
⏰ Estimated Duration: Not specified
📝 Special Requirements: ${msg || 'None'}`;
  window.open(window.FotoStar.utils.buildWaLink(waMsg), '_blank');
  closeModal();
  this.reset();
});
})();
