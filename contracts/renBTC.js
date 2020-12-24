export default {
	address: '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d',
	abi: [
		{
			constant: true,
			inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
			name: 'balanceOf',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			payable: false,
			stateMutability: 'view',
			type: 'function',
		},
		{
			constant: true,
			inputs: [{ internalType: 'address', name: '_account', type: 'address' }],
			name: 'balanceOfUnderlying',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			payable: false,
			stateMutability: 'view',
			type: 'function',
		},
	],
};
