angular.module('TotDocTracker.notifier', [])
  .factory("Notifier", ['notificationService', function(notificationService) {
    return {
      notifySuccess: function(text) {
        notificationService.notify({
          title: 'Success',
          title_escape: false,
          text_escape: false,
          text: text || '',
          styling: "bootstrap3",
          type: "success",
          icon: true,
          delay: 4000
        });
      },
      notifyError: function(text) {
        notificationService.notify({
          title: 'Uh oh',
          title_escape: false,
          text: text || '',
          text_escape: false,
          styling: "bootstrap3",
          type: "error",
          icon: true,
          delay: 4000
        });
      }
    };
  }]);