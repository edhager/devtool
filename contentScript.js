const observer = new MutationObserver(function () {
	const b = (typeof browser !== 'undefined' && browser) || (typeof chrome !== 'undefined' && chrome);
	console.log('mutations!');
	b.runtime.sendMessage({ refresh: true });
});
observer.observe(document.body, {
	childList: true,
	attributes: true,
	characterData: true,
	subtree: true
});
