import { createSelector } from 'reselect'
import moment from 'moment'
import _ from 'lodash'

export const getPhotoState = (state) => _.get(state, 'photos')

export const getHasLoading = createSelector(
  [getPhotoState],
  (photos) => _.get(photos, 'loading'),
)

export const getHasLoadedOnce = createSelector(
  [getPhotoState],
  (photos) => _.get(photos, 'hasLoadedOnce'),
)

export const getPhotosModel = createSelector(
  [getPhotoState],
  (photos) => _.get(photos, 'model'),
)

export const getPhotosHashMap = createSelector(
  [getPhotosModel],
  (photos) => _.keyBy(photos, 'id'),
)

export const getPhotoById = createSelector(
  getPhotosHashMap,
  (state, props) => _.get(props, ['navigation', 'state', 'params', 'id']),
  (photos, id) => _.get(photos, id),
)

export const groupPhotosByDate = _.flow(
  (col) =>
    _.groupBy(col, ({ created_at }) =>
      moment(created_at)
        .startOf('day')
        .format(),
    ),
  (col) => _.map(col, (group, day) => ({ day, group })),
  (col) => _.sortBy(col, 'day'),
  (col) =>
    _.map(col, ({ day, group: data }) => ({
      title: moment(day).format('dddd D MMM'),
      data,
    })),
)

export const getPhotosGroupByDate = createSelector(
  [getPhotosModel],
  (photos) => groupPhotosByDate(photos),
)

export const getPhotosByAlbumId = createSelector(
  getPhotosModel,
  (state, props) => _.get(props, 'id'),
  (photos, album_id) =>
    _.flow(
      (col) => _.groupBy(col, 'album_id'),
      (col) => _.get(col, album_id),
      (col) => groupPhotosByDate(col),
    )(photos),
)

export const getPhotos = createSelector(
  (state, props) => ({
    state,
    id: _.get(props, ['navigation', 'state', 'params', 'id']),
  }),
  ({ state, id }) =>
    _.isNil(id)
      ? getPhotosGroupByDate(state)
      : getPhotosByAlbumId(state, { id }),
)
