public without sharing class Data {
	@AuraEnabled(cacheable=true)
	public static String getServer() {
		String output = '';
		SocketIO__mdt defaults = SocketIO__mdt.getInstance('DEFAULT');
		SocketIO_Server__mdt server = SocketIO_Server__mdt.getInstance(defaults.Server__c);
		output = server.URL__c;
		return output;
	}
}
