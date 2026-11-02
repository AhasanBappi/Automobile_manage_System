# Administrator contribution

This package contains only the Administrator module for the Automobile Management System.
Copy its `admin/` and `js/` directories into the root of the shared repository, preserving these paths.

## Included files

- admin/dashboard.html
- admin/users.html
- admin/settings.html
- admin/reports.html
- admin/activity.html
- js/admin.js

Features: dashboard statistics, staff account creation, user roles and activation, categories and service types, rental rules, demo-data reset, summary reports, CSV exports, and activity logs.

## Shared dependencies for team integration

These files are already in the full local project and are intentionally excluded from this admin-only contribution:

- css/style.css: shared page styling.
- js/common.js: localStorage helpers and initialization, login checks, validation, activity logging, date and money helpers.
- login.html and js/account.js: shared login and account handling.
- profile.html: shared profile page linked by the admin navigation.

The admin module needs those shared files before it can run. All team modules must use the same localStorage schema in js/common.js: ams_users, ams_cars, ams_purchases, ams_rentals, ams_repairs, ams_slots, ams_history, ams_settings, and ams_log. Run the integrated project on the same browser origin so the modules share records.

Customer, manager, and technician pages and scripts, images, and the full-project ZIP are not included.
