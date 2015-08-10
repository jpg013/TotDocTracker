var apiPrefix = '/app/api';

angular.module('TotDocTracker')
  .service('InfoItems', ['CurrentUser', function(CurrentUser) {
    return {
      getInfoItems: function() {
        // Logic to determine what info items the user needs.
        debugger;
        var user = CurrentUser.getUser();
        var infoItems = [];
        if (!user.kids.length) {
          var item = {
            title: "Add Your Kids",
            msg: "You don't have any kids added to you profile. Before you can create an appointment you need to add at least one kid. Click on the kids link to add your kids."
          };
          infoItems.push(item);
          return infoItems;
        }
      }
    };
  }])
  .service('InfiniteScrollList', ['$http', function($http) {
    var InfiniteScrollList = function(opts) {
      // Defaults
      this.items = [];
      this.busy = false;
      this.page = 1;
      this.limit = opts.limit || 7;
      this.hasMore = true;
      this.url = opts.url;
    };

    InfiniteScrollList.prototype.more = function() {
      if (this.busy) { return; }
      if (!this.hasMore) { return; }
      this.busy = true; // We're busy now
      var url = this.url;
      return $http({
        url: url,
        method: "GET",
        params: {
          page: this.page,
          limit: this.limit
        }
      })
      .success(function(response) {
        if(response.success) {
          if(response.hasResults) {
            _.each(response.list, _.bind(function(item) {
              this.items.push(item);
            }, this));
            this.page++;
          } else{
            this.hasMore = false;
          }
        }
        this.busy = false; // Always reset the busy flag
      }.bind(this));
    };

    // remove items based off of mongo _id match
    InfiniteScrollList.prototype.removeItem = function(id) {
      if (!id) {return;}
      _.each(this.items, _.bind(function(item, index) {
        if (id === item._id) {
          delete this.items[index];
          this.items.splice(index,1);
        }
      }, this));
    };

    return InfiniteScrollList;
  }]);
