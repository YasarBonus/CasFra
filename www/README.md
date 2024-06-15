## API Urls

Use this: https://docs.strapi.io/dev-docs/api/rest/interactive-query-builder

### Casinos

```
{
  populate: {
    Boni: {
      fields: ['Percent', 'upTo']
    },
    features: {
      fields: ['Name'],
      populate: {
        Label: {
          fields: ['Label'],
          populate: {
            color: {
              fields: ['Hex']
          },
          icon: {
            fields: ['Alt'],
            populate: {
              Image: {
                fields: ['url']
              }
              }
            }
          }
        }
      }
    },
    Logo: {
      fields: ['url']
    }
  },
  fields: ['Name', 'MaxBet', 'Wager', 'WagerType', 'Label', 'Slug', 'MaxCashout'],
}
```

### Casino Details

```
{
  populate: {
    Boni: {
      fields: ['Percent', 'upTo', 'PromoCode', 'PromoCodeDescription', 'Freespins']
    },
    payment_methods: {
      fields: ['Name'],
      populate: {
        Logo: {
          fields: ['url']
        }
      }
    },
    features: {
      fields: ['Name'],
      populate: {
        icon: {
          fields: ['Alt'],
          populate: {
            Image: {
              fields: ['url']
            }
          }
        },
        Label: {
          fields: ['Label'],
          populate: {
            color: {
              fields: ['Hex']
            },
            icon: {
              fields: ['Alt'],
              populate: {
                Image: {
                  fields: ['url']
                }
              }
            },
          }
        }
      }
    },
    providers: {
      fields: ['Name'],
      populate: {
        Logo: {
          fields: ['url']
        }
      }
    },
    company: {
      fields: ['Name']
    },
    license: {
      fields: ['Name'],
      populate: {
        Logo: {
          fields: ['url']
        }
      }
    },
  },
  fields: ['Name'],
}
```